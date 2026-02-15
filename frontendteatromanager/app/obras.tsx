import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function ObrasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'adicionar' | 'visualizar'>('adicionar');
  const [obras, setObras] = useState<any[]>([]);
  const [form, setForm] = useState({ titulo: '', autor: '', data: '', descricao: '' });

  const API_URL = 'http://localhost:5002/api/v1/obras';

  // Função centralizada para pegar o token limpo
  const getCleanToken = () => {
    const rawToken = localStorage.getItem('userToken');
    if (!rawToken) return "";
    try {
      const parsed = JSON.parse(rawToken);
      const token = typeof parsed === 'object' ? parsed.token : parsed;
      return token.replace(/^"|"$/g, '').trim();
    } catch (e) {
      return rawToken.replace(/^"|"$/g, '').trim();
    }
  };

  useEffect(() => {
    const token = getCleanToken();
    if (!token) {
      router.replace('/');
      return;
    }
    if (activeTab === 'visualizar') fetchObras();
  }, [activeTab]);

  const fetchObras = async () => {
    const token = getCleanToken();
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setObras(data);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    }
  };

  // FUNÇÃO QUE ESTAVA FALTANDO:
  const deleteObra = async (id: number) => {
    const token = getCleanToken();
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        Alert.alert("Sucesso", "Obra removida!");
        fetchObras(); // Atualiza a lista
      } else {
        Alert.alert("Erro", "Não foi possível apagar a obra.");
      }
    } catch (e) {
      Alert.alert("Erro", "Erro de conexão ao apagar.");
    }
  };

  const handleSave = async () => {
    if (!form.titulo || !form.autor || !form.data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios (*)');
      return;
    }

    setLoading(true);
    try {
      const cleanToken = getCleanToken();
      console.log("TOKEN ENVIADO: [" + cleanToken + "]");

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanToken}` 
        },
        body: JSON.stringify({
          nome: form.titulo,      // Mapeado para o seu DTO Java
          diretor: form.autor,    // Mapeado para o seu DTO Java
          data: form.data,        
          descricao: form.descricao,
          local: "Teatro Principal",
          elenco: "N/A",
          nota: 5
        }),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Obra cadastrada no banco!');
        setForm({ titulo: '', autor: '', data: '', descricao: '' });
        setActiveTab('visualizar');
      } else {
        const errorDetail = await response.text();
        console.error("Erro do servidor Java:", errorDetail);
        Alert.alert('Erro', 'Sessão inválida ou erro no preenchimento.');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>🎭 Teatro Manager</Text>
        <TouchableOpacity onPress={() => { localStorage.removeItem('userToken'); router.replace('/'); }}>
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuTab}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'adicionar' && styles.tabActive]} 
          onPress={() => setActiveTab('adicionar')}
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

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'adicionar' ? (
          <View style={styles.card}>
            <Text style={styles.label}>Título da Obra *</Text>
            <TextInput style={styles.input} value={form.titulo} onChangeText={(t) => setForm({...form, titulo: t})} placeholder="Ex: O Fantasma da Ópera" />

            <Text style={styles.label}>Autor / Diretor *</Text>
            <TextInput style={styles.input} value={form.autor} onChangeText={(t) => setForm({...form, autor: t})} placeholder="Ex: Andrew Lloyd Webber" />

            <Text style={styles.label}>Data da Apresentação *</Text>
            <input 
              type="date" 
              style={{
                padding: '15px', borderRadius: '12px', border: '1px solid #DDD',
                marginBottom: '20px', fontSize: '16px', backgroundColor: '#F8F9FA',
                width: '100%', outline: 'none'
              }} 
              value={form.data} 
              onChange={(e) => setForm({...form, data: e.target.value})} 
            />

            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={form.descricao} 
              onChangeText={(t) => setForm({...form, descricao: t})} 
              multiline 
              placeholder="Conte um pouco sobre a peça..." 
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>SALVAR OBRA NO BANCO</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {obras.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma obra cadastrada.</Text>
            ) : (
              obras.map((item) => (
                <View key={item.id} style={styles.obraCard}>
                  <View style={styles.obraInfoContainer}>
                    {/* ATENÇÃO: Usando item.nome e item.diretor (como no seu Java) */}
                    <Text style={styles.obraTitle}>{item.nome}</Text>
                    <Text style={styles.obraInfoText}>{item.diretor} • {item.data}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteObra(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>APAGAR</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  topBar: { paddingTop: 60, padding: 25, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  topBarTitle: { fontSize: 20, fontWeight: '800', color: '#6200EE' },
  logoutText: { color: '#FF4757', fontWeight: 'bold', fontSize: 14 },
  menuTab: { flexDirection: 'row', backgroundColor: '#FFF' },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6200EE' },
  tabText: { fontWeight: 'bold', color: '#999', fontSize: 13 },
  tabTextActive: { color: '#6200EE' },
  content: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#DDD' },
  textArea: { height: 80 },
  saveBtn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  obraCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  obraInfoContainer: { flex: 1 },
  obraTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  obraInfoText: { color: '#666', fontSize: 13, marginTop: 4 },
  deleteBtn: { backgroundColor: '#FFE5E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  deleteBtnText: { color: '#FF4757', fontWeight: 'bold', fontSize: 11 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});