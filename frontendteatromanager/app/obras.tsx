import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Feedback, { FeedbackType } from './components/Feedback';
import ConfirmModal from './components/ConfirmModal';
import { apiFetch } from './utils/apiFetch';

interface Obra {
  id: number;
  nome: string;
  diretor: string;
  data: string; // yyyy-MM-dd
  local: string;
  elenco: string;
  descricao?: string;
  nota: number;
}

interface FormState {
  titulo: string;
  autor: string;
  data: string;
  descricao: string;
  local: string;
  elenco: string;
  nota: string;
}

const defaultForm: FormState = { titulo: '', autor: '', data: '', descricao: '', local: '', elenco: '', nota: '5' };

export default function ObrasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'adicionar' | 'visualizar'>('adicionar');
  const [obras, setObras] = useState<Obra[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editing, setEditing] = useState<Obra | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type?: FeedbackType } | null>(null);

  // valida token e redireciona se necessário
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      router.replace('/');
      return;
    }
    if (activeTab === 'visualizar') fetchObras();
  }, [activeTab]);

  const fetchObras = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/obras');
      if (res.ok) {
        const data: Obra[] = await res.json();
        setObras(data);
      } else {
        setFeedback({ message: 'Falha ao carregar obras.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ message: 'Erro de conexão ao buscar obras.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.titulo || !form.autor || !form.data) {
      setFeedback({ message: 'Preencha campos obrigatórios.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const formattedDate = new Date(form.data).toISOString().split('T')[0];
      const body = {
        nome: form.titulo,
        diretor: form.autor,
        data: formattedDate,
        descricao: form.descricao,
        local: form.local || 'Teatro Principal',
        elenco: form.elenco || 'N/A',
        nota: Number(form.nota) || 5,
      };

      const path = editing ? `/obras/${editing.id}` : '/obras';
      const method = editing ? 'PUT' : 'POST';
      const res = await apiFetch(path, { method, body: JSON.stringify(body) });

      if (res.ok) {
        setFeedback({ message: editing ? 'Obra atualizada!' : 'Obra criada!', type: 'success' });
        setForm(defaultForm);
        setEditing(null);
        setActiveTab('visualizar');
        fetchObras();
      } else {
        const text = await res.text();
        console.error('erro backend', text);
        setFeedback({ message: 'Erro ao salvar obra.', type: 'error' });
      }
    } catch (e) {
      setFeedback({ message: 'Erro de conexão.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const prepareEdit = (obra: Obra) => {
    setEditing(obra);
    setForm({
      titulo: obra.nome,
      autor: obra.diretor,
      data: obra.data,
      descricao: obra.descricao || '',
      local: obra.local,
      elenco: obra.elenco,
      nota: String(obra.nota),
    });
    setActiveTab('adicionar');
  };

  const confirmDelete = (obra: Obra) => {
    setSelectedObra(obra);
    setConfirmVisible(true);
  };

  const deleteObra = async () => {
    if (!selectedObra) return;
    setConfirmVisible(false);
    setLoading(true);
    try {
      const res = await apiFetch(`/obras/${selectedObra.id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ message: 'Obra removida.', type: 'success' });
        fetchObras();
      } else {
        setFeedback({ message: 'Falha ao apagar obra.', type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Erro de conexão.', type: 'error' });
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedObra(null);
    }
  };

  const filtered = obras.filter(o =>
    o.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.diretor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {feedback && <Feedback message={feedback.message} type={feedback.type} onHide={() => setFeedback(null)} />}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🎭 Teatro Manager</Text>
        <TouchableOpacity onPress={() => { localStorage.removeItem('userToken'); router.replace('/'); }}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuTab}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'adicionar' && styles.tabActive]}
          onPress={() => { setActiveTab('adicionar'); setEditing(null); setForm(defaultForm); }}
        >
          <Text style={[styles.tabText, activeTab === 'adicionar' && styles.tabTextActive]}>ADICIONAR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'visualizar' && styles.tabActive]}
          onPress={() => setActiveTab('visualizar')}
        >
          <Text style={[styles.tabText, activeTab === 'visualizar' && styles.tabTextActive]}>VISUALIZAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {activeTab === 'adicionar' ? (
          <View style={styles.card}>
            <Text style={styles.label}>{editing ? 'Editar Obra' : 'Nova Obra'}</Text>
            <TextInput style={styles.input} value={form.titulo} onChangeText={(t: string) => setForm({ ...form, titulo: t })} placeholder="Título da obra*" />
            <TextInput style={styles.input} value={form.autor} onChangeText={(t: string) => setForm({ ...form, autor: t })} placeholder="Diretor*" />
            <TextInput style={styles.input} value={form.data} onChangeText={(t: string) => setForm({ ...form, data: t })} placeholder="Data (yyyy-MM-dd)*" />
            <TextInput style={styles.input} value={form.local} onChangeText={(t: string) => setForm({ ...form, local: t })} placeholder="Local" />
            <TextInput style={styles.input} value={form.elenco} onChangeText={(t: string) => setForm({ ...form, elenco: t })} placeholder="Elenco" />
            <TextInput style={[styles.input, styles.textArea]} value={form.descricao} onChangeText={(t: string) => setForm({ ...form, descricao: t })} placeholder="Descrição" multiline />
            <TextInput style={styles.input} value={form.nota} onChangeText={(t: string) => setForm({ ...form, nota: t })} placeholder="Nota" keyboardType="numeric" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>{editing ? 'ATUALIZAR' : 'SALVAR'}</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nome ou diretor"
              value={searchTerm}
              onChangeText={(t: string) => setSearchTerm(t)}
            />
            {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
            {filtered.length === 0 && !loading ? (
              <Text style={styles.emptyText}>Nenhuma obra encontrada.</Text>
            ) : (
              filtered.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.obraCard}
                  onPress={() => { setSelectedObra(item); setModalVisible(true); }}
                >
                  <View style={styles.obraInfoContainer}>
                    <Text style={styles.obraTitle}>{item.nome}</Text>
                    <Text style={styles.obraInfoText}>{item.diretor}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* detalhes modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            {selectedObra && (
              <> 
                <Text style={styles.modalTitle}>{selectedObra.nome}</Text>
                <Text style={styles.modalText}>Diretor: {selectedObra.diretor}</Text>
                <Text style={styles.modalText}>Data: {selectedObra.data}</Text>
                <Text style={styles.modalText}>Local: {selectedObra.local}</Text>
                <Text style={styles.modalText}>Elenco: {selectedObra.elenco}</Text>
                <Text style={styles.modalText}>Nota: {selectedObra.nota}</Text>
                <Text style={styles.modalText}>{selectedObra.descricao}</Text>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalEdit]} onPress={() => { prepareEdit(selectedObra); setModalVisible(false); }}>
                    <Text style={styles.modalBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalDelete]} onPress={() => confirmDelete(selectedObra)}>
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Apagar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* confirmação de exclusão */}
      <ConfirmModal
        visible={confirmVisible}
        message="Deseja realmente apagar essa obra?"
        onConfirm={deleteObra}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { paddingTop: 60, padding: 25, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , borderBottomWidth: 1, borderBottomColor: '#EEE' },
  topBarTitle: { fontSize: 20, fontWeight: '800', color: '#6366F1' },
  logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  menuTab: { flexDirection: 'row', backgroundColor: '#FFF' },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6366F1' },
  tabText: { fontWeight: 'bold', color: '#999', fontSize: 13 },
  tabTextActive: { color: '#6366F1' },
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20 },
  label: { fontSize: 16, fontWeight: '700', color: '#444', marginBottom: 8 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  textArea: { height: 80 },
  saveBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  searchInput: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', marginBottom: 10 },
  obraCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  obraInfoContainer: { flex: 1 },
  obraTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  obraInfoText: { color: '#666', fontSize: 13, marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#6366F1' },
  modalText: { fontSize: 14, marginBottom: 6, color: '#444' },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalEdit: { backgroundColor: '#10B981', marginRight: 8 },
  modalDelete: { backgroundColor: '#EF4444' },
  modalBtnText: { fontSize: 14, fontWeight: '600' },
  modalClose: { marginTop: 15, alignItems: 'center' },
  modalCloseText: { color: '#6366F1', fontWeight: '600' }
});