package Manager.TeatroManager.service.dto;

import java.time.LocalDate;

public record ObraResponseDTO(String nome, LocalDate dataAssistida, String local, 
    String diretor, String elenco, String descricao,Integer nota) {
    
}
