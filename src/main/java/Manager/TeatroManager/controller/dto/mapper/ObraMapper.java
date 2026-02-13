package Manager.TeatroManager.controller.dto.mapper;

import org.modelmapper.ModelMapper;

import Manager.TeatroManager.controller.dto.ObraResponseDTO;
import Manager.TeatroManager.controller.dto.ObraResquestDTO;
import Manager.TeatroManager.entity.Obra;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;


@NoArgsConstructor(access= AccessLevel.PRIVATE)
public class ObraMapper {
    

    public static Obra toObra(ObraResquestDTO obraResquestDTO){

        return new ModelMapper().map(obraResquestDTO, Obra.class);
    }

    public static ObraResponseDTO toObraResponseDto(Obra obra){
        
        return new ModelMapper().map(obra, ObraResponseDTO.class);
    }
}
