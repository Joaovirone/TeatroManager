package Manager.TeatroManager.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import Manager.TeatroManager.entity.Usuario;


public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    
    Optional<Usuario> findUsuarioByUsername(String username);

}
