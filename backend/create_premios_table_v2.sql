CREATE TABLE IF NOT EXISTS premios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  pontos_necessarios INT NOT NULL,
  responsavel_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_responsavel FOREIGN KEY (responsavel_id) REFERENCES responsaveis(id) ON DELETE CASCADE
);
