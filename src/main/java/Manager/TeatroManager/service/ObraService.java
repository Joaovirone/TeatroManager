package Manager.TeatroManager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<Obra> buscarObraPorNome (String nome){
        
      List<Obra> obras = repository.findByNomeContainigIgnoreCase(nome);

      if(obras.isEmpty()){
        throw new EntityNotFoundException(
            String.format("A obra de nome | %s | -- Não está cadastrada.", nome)
        );
      }

      return obras;
        
    }


}
