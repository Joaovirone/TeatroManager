package Manager.TeatroManager.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import javax.management.RuntimeErrorException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Manager.TeatroManager.controller.dto.ObraResponseDTO;
import Manager.TeatroManager.entity.Obra;
import Manager.TeatroManager.exception.EntityNotFoundException;
import Manager.TeatroManager.repository.ObraRepository;

@Service
public class ObraService {
    
    @Autowired
    private ObraRepository repository;

    @Transactional
    public Obra salvarObra(Obra obra){
        
        return repository.save(obra);
    }


    @Transactional(readOnly = true)
    public List<Obra> buscarTodasAsObras(){
        return repository.findAll();
    }


    @Transactional(readOnly = true)
    public List<Obra> buscarObraPorNome (String nome){
        
      List<Obra> obras = repository.findByNomeContainigIgnoreCase(nome);

      if(obras.isEmpty()){
        throw new EntityNotFoundException(
            String.format("A obra de nome | %s | -- Não está cadastrada.", nome)
        );
      }
      return obras;     
    }

    @Transactional(readOnly = true)
    public Obra buscarObraPorData(LocalDateTime data){
      return repository.findObraByDate(data).
            orElseThrow(()-> new RuntimeException("A data da obra | %s | -- Não está registrada no banco de dados"));

 
    }

    @Transactional(readOnly = true)
    public List<Obra> buscarObraPorNomeDoDiretor (String nome){
        
      List<Obra> diretor = repository.findObraByNomeDiretor(nome);

      if(diretor.isEmpty()){
        throw new EntityNotFoundException(
            String.format("O diretor | %s | -- Não está registrado no banco de dados.", nome)
        );
      }
      return diretor;  
    }

    @Transactional(readOnly = true)
    public Obra buscarObraPorDescricao(String descricao){
      return repository.findObraByDescricao(descricao).
            orElseThrow(()-> new RuntimeException("A essa descrição | %s | -- Não está registrada no banco de dados"));

 
    }


    public Obra buscarTodasAsObras(ObraResponseDTO obraDTO) {
      // TODO Auto-generated method stub
      throw new UnsupportedOperationException("Unimplemented method 'buscarTodasAsObras'");
    }


}
