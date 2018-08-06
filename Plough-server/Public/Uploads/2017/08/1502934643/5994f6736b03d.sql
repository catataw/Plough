-- phpMyAdmin SQL Dump
-- version 4.0.4.1
-- http://www.phpmyadmin.net
--
-- 主机: 127.0.0.1
-- 生成日期: 2017 �?08 �?16 �?05:37
-- 服务器版本: 5.6.11
-- PHP 版本: 5.5.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `pmo_manager`
--

-- --------------------------------------------------------

--
-- 表的结构 `pmo_complain`
--

CREATE TABLE IF NOT EXISTS `pmo_complain` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `projectId` varchar(20) DEFAULT NULL,
  `projectName` varchar(20) NOT NULL,
  `complainant` varchar(20) DEFAULT NULL,
  `complaintLevel` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 为一般投诉，2为严重投诉，3为重大投诉',
  `complaintWay` varchar(30) NOT NULL,
  `respondent` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL COMMENT '1为接受 2为处理中 3为客户确认中 4为投诉关闭',
  `complainTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `complaintCompany` varchar(50) NOT NULL,
  `complaintContent` text NOT NULL,
  `urlPath` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
