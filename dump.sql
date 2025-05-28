-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: atravesdajanela01
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `atravesdajanela01`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `atravesdajanela01` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `atravesdajanela01`;

--
-- Table structure for table `atividades`
--

DROP TABLE IF EXISTS `atividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atividades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `pontuacao` int NOT NULL,
  `data_limite` date NOT NULL,
  `filho_id` int NOT NULL,
  `responsavel_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `concluida` tinyint(1) DEFAULT '0',
  `pontos_atualizados` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `filho_id` (`filho_id`),
  KEY `responsavel_id` (`responsavel_id`),
  CONSTRAINT `atividades_ibfk_1` FOREIGN KEY (`filho_id`) REFERENCES `criacao_filhos` (`id`),
  CONSTRAINT `atividades_ibfk_2` FOREIGN KEY (`responsavel_id`) REFERENCES `responsaveis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atividades`
--

LOCK TABLES `atividades` WRITE;
/*!40000 ALTER TABLE `atividades` DISABLE KEYS */;
INSERT INTO `atividades` VALUES (38,'Fez comentários maldosos em um jogo','Disse algo ofensivo ou zombou de alguém durante uma partida online, contribuindo para um ambiente tóxico.',-30,'2025-06-15',56,10,'2025-05-27 04:58:22',1,1),(39,'Mostrou suas redes sociais','Compartilhou com os responsáveis o que tem feito ou postado nas redes sociais, demonstrando confiança e responsabilidade online.',80,'2025-06-01',56,10,'2025-05-27 04:58:58',1,1),(40,'Defendeu um colega de zoações online','Apoiou um colega que estava sendo alvo de piadas ou comentários maldosos na internet, mostrando empatia e coragem.',30,'2025-06-10',56,10,'2025-05-27 04:59:49',1,1),(41,'Defendeu um colega de zoações online','Defendeu um colega de zoações online',30,'2025-06-10',56,10,'2025-05-27 18:59:56',1,1),(42,'Defendeu um colega de zoações online Defendeu um colega de zoações online Defendeu um colega de zoações online','Defendeu um colega de zoações online',30,'2025-06-10',56,10,'2025-05-27 19:00:53',1,1),(43,'Defendeu um colega de zoações online Defendeu um colega de zoações online','Defendeu um colega de zoações online Defendeu um colega de zoações online',-30,'2025-06-10',56,10,'2025-05-27 19:37:00',1,1),(44,'Defendeu um colega de zoações online Defendeu um colega de zoações online','121',-30,'2025-06-10',57,10,'2025-05-27 23:45:04',1,1),(45,'Defendeu um colega de zoações online Defendeu um colega de zoações online','a',-30,'2025-06-10',56,10,'2025-05-27 23:45:17',1,1),(46,'Defendeu um colega de zoações online Defendeu um colega de zoações online','a',100,'2025-06-23',57,10,'2025-05-28 01:58:52',1,1),(47,'Defendeu um colega de zoações online Defendeu um colega de zoações onlinea','aaa',10,'2025-06-09',56,10,'2025-05-28 01:59:11',1,1),(48,'Defendeu um colega de zoações online Defendeu um colega de zoações online','a',100,'2025-06-23',57,10,'2025-05-28 18:09:12',0,0);
/*!40000 ALTER TABLE `atividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `criacao_filhos`
--

DROP TABLE IF EXISTS `criacao_filhos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `criacao_filhos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `responsaveis_id` int DEFAULT NULL,
  `pontos` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_responsaveis_id` (`responsaveis_id`),
  CONSTRAINT `fk_responsaveis_id` FOREIGN KEY (`responsaveis_id`) REFERENCES `responsaveis` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `criacao_filhos`
--

LOCK TABLES `criacao_filhos` WRITE;
/*!40000 ALTER TABLE `criacao_filhos` DISABLE KEYS */;
INSERT INTO `criacao_filhos` VALUES (56,'Ana','Ana.a@email.com',10,90),(57,'Anaa','Ana.aa@email.com',10,70);
/*!40000 ALTER TABLE `criacao_filhos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premios`
--

DROP TABLE IF EXISTS `premios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `pontos_necessarios` int NOT NULL,
  `responsavel_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `emoji` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_responsavel` (`responsavel_id`),
  CONSTRAINT `fk_responsavel` FOREIGN KEY (`responsavel_id`) REFERENCES `responsaveis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premios`
--

LOCK TABLES `premios` WRITE;
/*!40000 ALTER TABLE `premios` DISABLE KEYS */;
INSERT INTO `premios` VALUES (33,'Vale 1 hora de videogame','Troque por 1 hora extra de jogo no fim de semana.',50,10,'2025-05-27 04:47:11','🎮'),(34,'Escolher o jantar de sexta-feira','Você decide o cardápio da sexta à noite.',70,10,'2025-05-27 04:47:40','🍕'),(35,'Pular uma tarefa de casa (com aprovação)','Você pode escolher uma tarefa para não fazer.',100,10,'2025-05-27 04:48:21','📚');
/*!40000 ALTER TABLE `premios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsaveis`
--

DROP TABLE IF EXISTS `responsaveis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `responsaveis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `nome_filho` varchar(100) NOT NULL,
  `idade_filho` int NOT NULL,
  `instituicao_ensino` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsaveis`
--

LOCK TABLES `responsaveis` WRITE;
/*!40000 ALTER TABLE `responsaveis` DISABLE KEYS */;
INSERT INTO `responsaveis` VALUES (1,'Larissa ','Larissa@email.com','123456',NULL,'',0,NULL),(2,'Carlos Eduardo Cabral de Melo Neto','Carlos@email.com','123456','','Pepeu',3,''),(3,'Isabelle ','isabelledejesus12@gmail.com','123456','','Pepito',1,''),(4,'Ana','Ana@email.com','123456','','a',5,''),(5,'Luiza','Luiza@email.com','123456','','Luiz',10,'Escola Luiziana'),(6,'Luiz','Luiz@email.com','123456','','Luiza',11,'Escola Luiziano'),(7,'Ana Carolina Ribeiro','CarolinaRibeiro@email.com','123456','','Junior',16,''),(8,'Ana Carolina Ribeiro Joana','CarolinaRibeiroJ@email.com','123456','','Junia',17,''),(9,'Tereza Cristina Baade','TerezaBaade@email.com','123456','','Carlos',17,''),(10,'Gabriel Galileu Galileia','GabrialG@email.com','123456','81999999999','Julia',7,'Colegio Dourado'),(11,'Mariana Rosana','mariana.rosana@email.com','123456','81999999999','Rosa',12,'Colegio Rosana'),(13,'José Josélino','jose.joselino@email.com','123456','81999999999','Josefino',12,'Colegio José'),(15,'Benjamin','benjamin@email.com','123456','81999999999','Benjanos',18,'Colegio Beija');
/*!40000 ALTER TABLE `responsaveis` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-28 16:48:16
