package Manager.TeatroManager.entity;

import java.text.DateFormat;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "obras_teatrais")
public class Obra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name="nome_da_obra",nullable=false)
    private String nome;

    @Column(name="data_da_obra",columnDefinition="")
    private LocalDate dataAssistida;

    @Column(name="local_da_obra")
    private String local;

    @Column(name="nome_do_diretor")
    private String diretor;

    @Column(name="nome_do_elenco", columnDefinition="TEXT")
    private String elenco;

    @Column(name="descricao_da_obra", columnDefinition="TEXT")
    private String descricao;

    @Column(name="nota_da_obra", length=10)
    private Integer nota;

}
