require('dotenv').config();




const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');  // Added for JWT
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Definir qual banco usar pela flag no .env
const useLocal = process.env.USE_LOCAL_DB === 'true';

console.log('USE_LOCAL_DB:', process.env.USE_LOCAL_DB);
console.log('LOCAL_DB_USER:', process.env.LOCAL_DB_USER);
console.log('LOCAL_DB_PASSWORD:', process.env.LOCAL_DB_PASSWORD ? '*****' : '(não definido)');


const dbConfig = useLocal
  ? {
      host: process.env.LOCAL_DB_HOST,
      port: process.env.LOCAL_DB_PORT,
      user: process.env.LOCAL_DB_USER,
      password: process.env.LOCAL_DB_PASSWORD,
      database: process.env.LOCAL_DB_NAME,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    return;
  }
  console.log(`Conectado ao MySQL ${useLocal ? '(Local)' : '(Railway)'} com sucesso!`);
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha, tipo_usuario } = req.body;

  const tabela = tipo_usuario === 'responsavel' ? 'responsaveis' : 'filhos';

  const query = `SELECT * FROM ${tabela} WHERE email = ? AND senha = ?`;

  db.query(query, [email, senha], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro no servidor' });
    }

    if (results.length > 0) {
      const user = results[0];
      if (tipo_usuario === 'responsavel') {
        // Generate JWT token with user id
        const token = jwt.sign({ id: user.id }, 'your_jwt_secret_key', { expiresIn: '1h' });
        res.json({ sucesso: true, mensagem: 'Login bem-sucedido', token, dados: user });
      } else {
        res.json({ sucesso: true, mensagem: 'Login bem-sucedido', dados: user });
      }
    } else {
      res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
    }
  });
});

// cadastramento do responsavel
app.post('/cadastro-responsavel', (req, res) => {
  const {
    nomeCompleto,
    email,
    senha,
    telefone,
    nomeFilho,
    idadeFilho,
    instituicaoEnsino
  } = req.body;

  const query = `
    INSERT INTO responsaveis (nome, email, senha, telefone, nome_filho, idade_filho, instituicao_ensino)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [nomeCompleto, email, senha, telefone, nomeFilho, idadeFilho, instituicaoEnsino], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar responsável:', err);
      return res.status(500).json({ mensagem: 'Erro ao cadastrar' });
    }
    res.status(201).json({ mensagem: 'Responsável cadastrado com sucesso!' });
  });
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rota para criar filho (POST) - protected
app.post('/criar-filho', authenticateToken, (req, res) => {
  const { nome, email } = req.body;
  const responsavelId = req.user.id;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  const query = 'INSERT INTO criacao_filhos (nome, email, responsaveis_id) VALUES (?, ?, ?)';
  db.query(query, [nome, email, responsavelId], (err, result) => {
    if (err) {
      console.error('Erro ao inserir filho:', err.sqlMessage || err);
      return res.status(500).json({ error: 'Erro no servidor.' });
    }

    return res.status(201).json({ message: 'Filho criado com sucesso!' });
  });
});

// Rota para listar filhos (GET) - protected
app.get('/filhos', authenticateToken, (req, res) => {
  const responsavelId = req.user.id;
  console.log('Fetching filhos for responsavelId:', responsavelId);
  const query = 'SELECT id, nome, email, pontos FROM criacao_filhos WHERE responsaveis_id = ? ORDER BY id DESC';

  db.query(query, [responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar filhos:', err);
      return res.status(500).json({ error: 'Erro no servidor ao listar filhos.' });
    }

    console.log('Filhos encontrados:', results);
    if (!Array.isArray(results)) {
      console.error('Results is not an array:', results);
      return res.status(500).json({ error: 'Dados inválidos retornados do banco.' });
    }
    res.json(results);
  });
});

// Rota para editar filho (PUT)
app.put('/editar-filho/:id', (req, res) => {
  const { id } = req.params;  // Aqui você já está pegando o ID corretamente
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
  }

  const query = 'UPDATE criacao_filhos SET nome = ?, email = ? WHERE id = ?';
  db.query(query, [nome, email, id], (err, result) => {
    if (err) {
      console.error('Erro ao editar filho:', err);
      return res.status(500).json({ error: 'Erro no servidor ao editar filho.' });
    }

    res.json({ message: 'Filho editado com sucesso!' });
  });
});

// Rota para excluir filho (DELETE) com verificação e exclusão em cascata de atividades
app.delete('/excluir-filho/:id', (req, res) => {
  const { id } = req.params;

  // Primeiro, deletar as atividades associadas ao filho
  const queryDeleteAtividades = 'DELETE FROM atividades WHERE filho_id = ?';
  db.query(queryDeleteAtividades, [id], (err) => {
    if (err) {
      console.error('Erro ao excluir atividades do filho:', err);
      return res.status(500).json({ error: 'Erro ao excluir atividades do filho.' });
    }

    // Depois, deletar o filho
    const queryDeleteFilho = 'DELETE FROM criacao_filhos WHERE id = ?';
    db.query(queryDeleteFilho, [id], (err2, result) => {
      if (err2) {
        console.error('Erro ao excluir filho:', err2);
        return res.status(500).json({ error: 'Erro no servidor ao excluir filho.' });
      }

      // Responder com mensagem esperada pelo frontend
      res.json({ message: 'Filho excluído com sucesso!' });
    });
  });
});

// Rota para criar atividade (POST) - protected
app.post('/atividades', authenticateToken, (req, res) => {
  const { titulo, descricao, pontuacao, data_limite, filho_id } = req.body;
  const responsavelId = req.user.id;

  if (!titulo || !descricao || !pontuacao || !data_limite || !filho_id) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Verificar se o filho pertence ao responsável
  const queryFilho = 'SELECT id FROM criacao_filhos WHERE id = ? AND responsaveis_id = ?';
  db.query(queryFilho, [filho_id, responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar filho:', err);
      return res.status(500).json({ error: 'Erro no servidor.' });
    }
    if (results.length === 0) {
      return res.status(403).json({ error: 'Filho não pertence ao responsável.' });
    }

    // Inserir atividade
    const queryAtividade = `
      INSERT INTO atividades (titulo, descricao, pontuacao, data_limite, filho_id, responsavel_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(queryAtividade, [titulo, descricao, pontuacao, data_limite, filho_id, responsavelId], (err2, result) => {
      if (err2) {
        console.error('Erro ao inserir atividade:', err2);
        return res.status(500).json({ error: 'Erro ao salvar atividade.' });
      }
      res.status(201).json({ message: 'Atividade criada com sucesso!' });
    });
  });
});

// Rota para obter atividades recentes (últimas 5)
app.get('/atividades/recentes', authenticateToken, (req, res) => {
  const responsavelId = req.user.id;
  const query = `
    SELECT a.*, f.nome as nome_filho
    FROM atividades a
    JOIN criacao_filhos f ON a.filho_id = f.id
    WHERE a.responsavel_id = ?
    ORDER BY a.created_at DESC
    LIMIT 5
  `;
  db.query(query, [responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar atividades recentes:', err);
      return res.status(500).json({ error: 'Erro no servidor ao buscar atividades.' });
    }
    res.json(results);
  });
});

// Rota para obter todas as atividades para validação
app.get('/atividades', authenticateToken, (req, res) => {
  const responsavelId = req.user.id;
  const query = `
    SELECT a.*, f.nome as nome_filho
    FROM atividades a
    JOIN criacao_filhos f ON a.filho_id = f.id
    WHERE a.responsavel_id = ?
    ORDER BY a.created_at DESC
  `;
  db.query(query, [responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar atividades:', err);
      return res.status(500).json({ error: 'Erro no servidor ao buscar atividades.' });
    }
    res.json(results);
  });
});

// Rota para obter a contagem total de atividades concluídas por filho
app.get('/atividades/concluidas/count', authenticateToken, (req, res) => {
  const responsavelId = req.user.id;
  const query = `
    SELECT f.id as filho_id, f.nome as nome_filho, 
      COUNT(CASE WHEN a.concluida = TRUE THEN 1 END) as total_concluidas,
      COUNT(CASE WHEN a.concluida = FALSE THEN 1 END) as total_pendentes
    FROM criacao_filhos f
    LEFT JOIN atividades a ON a.filho_id = f.id
    WHERE f.responsaveis_id = ?
    GROUP BY f.id, f.nome
  `;
  db.query(query, [responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar contagem de atividades concluídas e pendentes:', err);
      return res.status(500).json({ error: 'Erro no servidor ao buscar contagem de atividades concluídas e pendentes.' });
    }
    res.json(results);
  });
});

// Rota para confirmar conclusão da atividade e atualizar pontos
app.post('/atividades/:id/confirmar', authenticateToken, (req, res) => {
  const atividadeId = req.params.id;
  const responsavelId = req.user.id;

  // Verificar se a atividade pertence ao responsável e não está concluída
  const queryCheck = `
    SELECT a.*, f.id as filho_id
    FROM atividades a
    JOIN criacao_filhos f ON a.filho_id = f.id
    WHERE a.id = ? AND a.responsavel_id = ? AND a.concluida = FALSE
  `;
  db.query(queryCheck, [atividadeId, responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar atividade:', err);
      return res.status(500).json({ error: 'Erro no servidor.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Atividade não encontrada ou já concluída.' });
    }

    const atividade = results[0];
    const filhoId = atividade.filho_id;
    const pontos = atividade.pontuacao;

    // Atualizar pontos do filho
    const queryUpdatePontos = `
      UPDATE criacao_filhos
      SET pontos = COALESCE(pontos, 0) + ?
      WHERE id = ?
    `;

    // Marcar atividade como concluída e pontos atualizados
    const queryUpdateAtividade = `
      UPDATE atividades
      SET concluida = TRUE, pontos_atualizados = TRUE
      WHERE id = ?
    `;

    db.query(queryUpdatePontos, [pontos, filhoId], (err2) => {
      if (err2) {
        console.error('Erro ao atualizar pontos do filho:', err2);
        return res.status(500).json({ error: 'Erro ao atualizar pontos.' });
      }

      db.query(queryUpdateAtividade, [atividadeId], (err3) => {
        if (err3) {
          console.error('Erro ao atualizar atividade:', err3);
          return res.status(500).json({ error: 'Erro ao atualizar atividade.' });
        }

        res.json({ message: 'Atividade confirmada e pontos atualizados com sucesso!' });
      });
    });
  });
});


// Rota para criar um novo prêmio (POST)
app.post('/api/premios', authenticateToken, (req, res) => {
  const { nome, descricao, pontos_necessarios, emoji } = req.body;
  const responsavelId = req.user.id;

  if (!nome || !descricao || pontos_necessarios === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const query = `
    INSERT INTO premios (nome, descricao, pontos_necessarios, emoji, responsavel_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [nome, descricao, pontos_necessarios, emoji, responsavelId], (err, result) => {
    if (err) {
      console.error('Erro ao inserir prêmio:', err);
      return res.status(500).json({ error: 'Erro ao salvar prêmio.' });
    }
    res.status(201).json({ message: 'Prêmio criado com sucesso!' });
  });
});

// Rota para obter todos os prêmios (GET)
app.get('/api/premios', authenticateToken, (req, res) => {
  const responsavelId = req.user.id;
  const query = 'SELECT id, nome, descricao, pontos_necessarios, emoji FROM premios WHERE responsavel_id = ? ORDER BY id DESC';

  db.query(query, [responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao buscar prêmios:', err);
      return res.status(500).json({ error: 'Erro ao buscar prêmios.' });
    }
    res.json(results);
  });
});

// New route to delete a prize by ID (DELETE)
app.delete('/api/premios/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const responsavelId = req.user.id;

  // Verify the prize belongs to the authenticated user
  const queryCheck = 'SELECT * FROM premios WHERE id = ? AND responsavel_id = ?';
  db.query(queryCheck, [id, responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar prêmio:', err);
      return res.status(500).json({ error: 'Erro no servidor.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Prêmio não encontrado ou não pertence ao usuário.' });
    }

    // Delete the prize
    const queryDelete = 'DELETE FROM premios WHERE id = ?';
    db.query(queryDelete, [id], (err2, result) => {
      if (err2) {
        console.error('Erro ao excluir prêmio:', err2);
        return res.status(500).json({ error: 'Erro ao excluir prêmio.' });
      }
      res.json({ message: 'Prêmio excluído com sucesso!' });
    });
  });
});

// New route to update a prize by ID (PUT)
app.put('/api/premios/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nome, descricao, pontos_necessarios, emoji } = req.body;
  const responsavelId = req.user.id;

  if (!nome || !descricao || pontos_necessarios === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // Verify the prize belongs to the authenticated user
  const queryCheck = 'SELECT * FROM premios WHERE id = ? AND responsavel_id = ?';
  db.query(queryCheck, [id, responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao verificar prêmio:', err);
      return res.status(500).json({ error: 'Erro no servidor.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Prêmio não encontrado ou não pertence ao usuário.' });
    }

    // Update the prize
    const queryUpdate = 'UPDATE premios SET nome = ?, descricao = ?, pontos_necessarios = ?, emoji = ? WHERE id = ?';
    db.query(queryUpdate, [nome, descricao, pontos_necessarios, emoji, id], (err2, result) => {
      if (err2) {
        console.error('Erro ao atualizar prêmio:', err2);
        return res.status(500).json({ error: 'Erro ao atualizar prêmio.' });
      }
      res.json({ message: 'Prêmio atualizado com sucesso!' });
    });
  });
});



// Rota para calcular a porcentagem de atividades concluídas com pontuação positiva por filho
app.get('/atividades/porcentagem-positivas', authenticateToken, (req, res) => {
  const responsavelId = req.user.id;
  const query = `
    SELECT 
      f.id as filho_id, 
      f.nome as nome_filho,
      COUNT(CASE WHEN a.concluida = TRUE AND a.pontuacao > 0 THEN 1 END) as concluidas_positivas,
      COUNT(CASE WHEN a.concluida = TRUE THEN 1 END) as concluidas_total
    FROM criacao_filhos f
    LEFT JOIN atividades a ON a.filho_id = f.id
    WHERE f.responsaveis_id = ?
    GROUP BY f.id, f.nome
  `;

  db.query(query, [responsavelId], (err, results) => {
    if (err) {
      console.error('Erro ao calcular porcentagem:', err);
      return res.status(500).json({ error: 'Erro no servidor ao calcular porcentagem.' });
    }

    const dadosFormatados = results.map(r => ({
      filho_id: r.filho_id,
      nome_filho: r.nome_filho,
      porcentagem_positivas: r.concluidas_total > 0 
        ? ((r.concluidas_positivas / r.concluidas_total) * 100).toFixed(2)
        : '0.00'
    }));

    res.json(dadosFormatados);
  });
});

// Servir arquivos estáticos corretamente, já que estamos dentro de /backend
app.use(express.static(path.join(__dirname, '../public')));

// E também a rota /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});



// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
