CREATE TABLE atividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  pontuacao INT NOT NULL,
  data_limite DATE NOT NULL,
  filho_id INT NOT NULL,
  responsavel_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (filho_id) REFERENCES criacao_filhos(id),
  FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id)
);
