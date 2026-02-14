package Manager.TeatroManager.controller.dto.mapper;

import org.modelmapper.ModelMapper;

import Manager.TeatroManager.controller.dto.UsuarioRequestDTO;
import Manager.TeatroManager.controller.dto.UsuarioResponseDTO;
import Manager.TeatroManager.entity.Usuario;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;


@NoArgsConstructor(access= AccessLevel.PRIVATE)
public class UsuarioMapper {
    
    public static Usuario toUsuario (UsuarioRequestDTO usuarioRequestDTO){
        return new ModelMapper().map(usuarioRequestDTO, Usuario.class);
    }

    public static UsuarioResponseDTO toUsuarioResponseDTO( Usuario usuario){

        return new ModelMapper().map(usuario, UsuarioResponseDTO.class);
    }
}
