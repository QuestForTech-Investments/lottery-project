import React, { useState, useEffect } from 'react';
import PasswordModal from './modals/PasswordModal';

const UserBancas = () => {
  const [selectedZones, setSelectedZones] = useState([
    'GRUPO GUYANA (JHON)',
    'GRUPO KENDRICK TL',
    'GRUPO GILBERTO TL',
    'GRUPO GUYANA (OMAR)',
    'GRUPO GUYANA (DANI)',
    'GRUPO GUYANA (EL GUARDIA)',
    'GRUPO GUYANA (COGNON)',
    'GRUPO GUYANA (ROSA KOUROU)',
    'GUYANA (JUDELAINE)'
  ]);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [quickFilter, setQuickFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);

  // Datos completos de usuarios (143 entradas como en el análisis)
  const usuarios = [
    { id: '001', banca: 'LA CENTRAL 01', referencia: 'GILBERTO ISLA GORDA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 49, colorAccion: 'blue' },
    { id: '010', banca: 'LA CENTRAL 10', referencia: 'GILBERTO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 50, colorAccion: 'green' },
    { id: '016', banca: 'LA CENTRAL 16', referencia: 'CHINO TL', requiereCambio: false, zona: 'GRUPO KENDRICK TL', numeroAccion: 51, colorAccion: 'orange' },
    { id: '063', banca: 'LA CENTRAL 63', referencia: 'NELL TL', requiereCambio: false, zona: 'GRUPO KENDRICK TL', numeroAccion: 52, colorAccion: 'purple' },
    { id: '101', banca: 'LA CENTRAL 101', referencia: 'FELO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 53, colorAccion: 'red' },
    { id: '119', banca: 'LA CENTRAL 119', referencia: 'EUDDY (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 54, colorAccion: 'brown' },
    { id: '135', banca: 'LA CENTRAL 135', referencia: 'MORENA D (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 55, colorAccion: 'gray' },
    { id: '150', banca: 'LA CENTRAL 150', referencia: 'DANNY (GF)', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 56, colorAccion: 'blue' },
    { id: '165', banca: 'LA CENTRAL 165', referencia: 'MANUELL (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 57, colorAccion: 'green' },
    { id: '182', banca: 'LA CENTRAL 182', referencia: 'TONA (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 58, colorAccion: 'orange' },
    { id: '185', banca: 'LA CENTRAL 185', referencia: 'JUDELAINE (GF)', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 30, colorAccion: 'purple' },
    { id: '194', banca: 'LA CENTRAL 194', referencia: 'HAITI (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 31, colorAccion: 'red' },
    { id: '198', banca: 'CARIBBEAN 198', referencia: 'LISSET (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 32, colorAccion: 'brown' },
    { id: '201', banca: 'LA CENTRAL 201', referencia: 'CLOTILDE (GF)', requiereCambio: false, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 33, colorAccion: 'gray' },
    { id: '203', banca: 'LA CENTRAL 203', referencia: 'IVAN (GF)', requiereCambio: true, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 34, colorAccion: 'blue' },
    { id: '230', banca: 'LA CENTRAL 230', referencia: 'YAN (GF)', requiereCambio: false, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 35, colorAccion: 'green' },
    { id: '254', banca: 'LA CENTRAL 254', referencia: 'DENIS (GF)', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 36, colorAccion: 'orange' },
    { id: '264', banca: 'CARIBBEAN 264', referencia: 'RAFAEL (FR)', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 37, colorAccion: 'purple' },
    { id: '269', banca: 'LA CENTRAL 269', referencia: 'JONATHAN TL', requiereCambio: false, zona: 'GRUPO KENDRICK TL', numeroAccion: 38, colorAccion: 'red' },
    { id: '279', banca: 'CARIBBEAN 279', referencia: 'MIKI(FR)', requiereCambio: true, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 39, colorAccion: 'brown' },
    { id: '300', banca: 'LA CENTRAL 300', referencia: 'NATIVIDAD (GF)', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 40, colorAccion: 'gray' },
    // Agregando más usuarios para llegar a 143
    { id: '002', banca: 'LA CENTRAL 02', referencia: 'CARLOS TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 41, colorAccion: 'blue' },
    { id: '003', banca: 'LA CENTRAL 03', referencia: 'MARIA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 42, colorAccion: 'green' },
    { id: '004', banca: 'LA CENTRAL 04', referencia: 'JOSE TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 43, colorAccion: 'orange' },
    { id: '005', banca: 'LA CENTRAL 05', referencia: 'ANA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 44, colorAccion: 'purple' },
    { id: '006', banca: 'LA CENTRAL 06', referencia: 'LUIS TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 45, colorAccion: 'red' },
    { id: '007', banca: 'LA CENTRAL 07', referencia: 'ROSA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 46, colorAccion: 'brown' },
    { id: '008', banca: 'LA CENTRAL 08', referencia: 'PEDRO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 47, colorAccion: 'gray' },
    { id: '009', banca: 'LA CENTRAL 09', referencia: 'SOFIA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 48, colorAccion: 'blue' },
    { id: '011', banca: 'LA CENTRAL 11', referencia: 'MIGUEL TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 49, colorAccion: 'green' },
    { id: '012', banca: 'LA CENTRAL 12', referencia: 'ELENA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 50, colorAccion: 'orange' },
    { id: '013', banca: 'LA CENTRAL 13', referencia: 'ANTONIO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 51, colorAccion: 'purple' },
    { id: '014', banca: 'LA CENTRAL 14', referencia: 'ISABEL TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 52, colorAccion: 'red' },
    { id: '015', banca: 'LA CENTRAL 15', referencia: 'FRANCISCO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 53, colorAccion: 'brown' },
    { id: '017', banca: 'LA CENTRAL 17', referencia: 'CARMEN TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 54, colorAccion: 'gray' },
    { id: '018', banca: 'LA CENTRAL 18', referencia: 'MANUEL TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 55, colorAccion: 'blue' },
    { id: '019', banca: 'LA CENTRAL 19', referencia: 'DOLORES TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 56, colorAccion: 'green' },
    { id: '020', banca: 'LA CENTRAL 20', referencia: 'RAFAEL TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 57, colorAccion: 'orange' },
    { id: '021', banca: 'LA CENTRAL 21', referencia: 'PILAR TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 58, colorAccion: 'purple' },
    { id: '022', banca: 'LA CENTRAL 22', referencia: 'JOAQUIN TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 59, colorAccion: 'red' },
    { id: '023', banca: 'LA CENTRAL 23', referencia: 'CONSUELO TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 60, colorAccion: 'brown' },
    { id: '024', banca: 'LA CENTRAL 24', referencia: 'FERNANDO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 61, colorAccion: 'gray' },
    { id: '025', banca: 'LA CENTRAL 25', referencia: 'GLORIA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 62, colorAccion: 'blue' },
    { id: '026', banca: 'LA CENTRAL 26', referencia: 'VICENTE TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 63, colorAccion: 'green' },
    { id: '027', banca: 'LA CENTRAL 27', referencia: 'TERESA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 64, colorAccion: 'orange' },
    { id: '028', banca: 'LA CENTRAL 28', referencia: 'SANTIAGO TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 65, colorAccion: 'purple' },
    { id: '029', banca: 'LA CENTRAL 29', referencia: 'ROCIO TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 66, colorAccion: 'red' },
    { id: '030', banca: 'LA CENTRAL 30', referencia: 'IGNACIO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 67, colorAccion: 'brown' },
    { id: '031', banca: 'LA CENTRAL 31', referencia: 'MONICA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 68, colorAccion: 'gray' },
    { id: '032', banca: 'LA CENTRAL 32', referencia: 'ALBERTO TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 69, colorAccion: 'blue' },
    { id: '033', banca: 'LA CENTRAL 33', referencia: 'BEATRIZ TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 70, colorAccion: 'green' },
    { id: '034', banca: 'LA CENTRAL 34', referencia: 'CESAR TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 71, colorAccion: 'orange' },
    { id: '035', banca: 'LA CENTRAL 35', referencia: 'DANIELA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 72, colorAccion: 'purple' },
    { id: '036', banca: 'LA CENTRAL 36', referencia: 'EDUARDO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 73, colorAccion: 'red' },
    { id: '037', banca: 'LA CENTRAL 37', referencia: 'FATIMA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 74, colorAccion: 'brown' },
    { id: '038', banca: 'LA CENTRAL 38', referencia: 'GABRIEL TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 75, colorAccion: 'gray' },
    { id: '039', banca: 'LA CENTRAL 39', referencia: 'HELENA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 76, colorAccion: 'blue' },
    { id: '040', banca: 'LA CENTRAL 40', referencia: 'IVAN TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 77, colorAccion: 'green' },
    { id: '041', banca: 'LA CENTRAL 41', referencia: 'JULIA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 78, colorAccion: 'orange' },
    { id: '042', banca: 'LA CENTRAL 42', referencia: 'KEVIN TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 79, colorAccion: 'purple' },
    { id: '043', banca: 'LA CENTRAL 43', referencia: 'LAURA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 80, colorAccion: 'red' },
    { id: '044', banca: 'LA CENTRAL 44', referencia: 'MARCOS TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 81, colorAccion: 'brown' },
    { id: '045', banca: 'LA CENTRAL 45', referencia: 'NATALIA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 82, colorAccion: 'gray' },
    { id: '046', banca: 'LA CENTRAL 46', referencia: 'OSCAR TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 83, colorAccion: 'blue' },
    { id: '047', banca: 'LA CENTRAL 47', referencia: 'PATRICIA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 84, colorAccion: 'green' },
    { id: '048', banca: 'LA CENTRAL 48', referencia: 'QUINTIN TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 85, colorAccion: 'orange' },
    { id: '049', banca: 'LA CENTRAL 49', referencia: 'REBECA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 86, colorAccion: 'purple' },
    { id: '050', banca: 'LA CENTRAL 50', referencia: 'SERGIO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 87, colorAccion: 'red' },
    { id: '051', banca: 'LA CENTRAL 51', referencia: 'TATIANA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 88, colorAccion: 'brown' },
    { id: '052', banca: 'LA CENTRAL 52', referencia: 'ULISES TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 89, colorAccion: 'gray' },
    { id: '053', banca: 'LA CENTRAL 53', referencia: 'VALENTINA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 90, colorAccion: 'blue' },
    { id: '054', banca: 'LA CENTRAL 54', referencia: 'WALTER TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 91, colorAccion: 'green' },
    { id: '055', banca: 'LA CENTRAL 55', referencia: 'XIMENA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 92, colorAccion: 'orange' },
    { id: '056', banca: 'LA CENTRAL 56', referencia: 'YOLANDA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 93, colorAccion: 'purple' },
    { id: '057', banca: 'LA CENTRAL 57', referencia: 'ZACARIAS TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 94, colorAccion: 'red' },
    { id: '058', banca: 'LA CENTRAL 58', referencia: 'ADRIANA TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 95, colorAccion: 'brown' },
    { id: '059', banca: 'LA CENTRAL 59', referencia: 'BRUNO TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 96, colorAccion: 'gray' },
    { id: '060', banca: 'LA CENTRAL 60', referencia: 'CLAUDIA TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 97, colorAccion: 'blue' },
    { id: '061', banca: 'LA CENTRAL 61', referencia: 'DIEGO TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 98, colorAccion: 'green' },
    { id: '062', banca: 'LA CENTRAL 62', referencia: 'ESTELA TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 99, colorAccion: 'orange' },
    { id: '064', banca: 'LA CENTRAL 64', referencia: 'FABIO TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 100, colorAccion: 'purple' },
    { id: '065', banca: 'LA CENTRAL 65', referencia: 'GABRIELA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 101, colorAccion: 'red' },
    { id: '066', banca: 'LA CENTRAL 66', referencia: 'HECTOR TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 102, colorAccion: 'brown' },
    { id: '067', banca: 'LA CENTRAL 67', referencia: 'IRENE TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 103, colorAccion: 'gray' },
    { id: '068', banca: 'LA CENTRAL 68', referencia: 'JAVIER TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 104, colorAccion: 'blue' },
    { id: '069', banca: 'LA CENTRAL 69', referencia: 'KARINA TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 105, colorAccion: 'green' },
    { id: '070', banca: 'LA CENTRAL 70', referencia: 'LEONARDO TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 106, colorAccion: 'orange' },
    { id: '071', banca: 'LA CENTRAL 71', referencia: 'MIRIAM TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 107, colorAccion: 'purple' },
    { id: '072', banca: 'LA CENTRAL 72', referencia: 'NICOLAS TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 108, colorAccion: 'red' },
    { id: '073', banca: 'LA CENTRAL 73', referencia: 'OLIVIA TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 109, colorAccion: 'brown' },
    { id: '074', banca: 'LA CENTRAL 74', referencia: 'PABLO TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 110, colorAccion: 'gray' },
    { id: '075', banca: 'LA CENTRAL 75', referencia: 'QUERIDA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 111, colorAccion: 'blue' },
    { id: '076', banca: 'LA CENTRAL 76', referencia: 'RAMON TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 112, colorAccion: 'green' },
    { id: '077', banca: 'LA CENTRAL 77', referencia: 'SILVIA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 113, colorAccion: 'orange' },
    { id: '078', banca: 'LA CENTRAL 78', referencia: 'TOMAS TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 114, colorAccion: 'purple' },
    { id: '079', banca: 'LA CENTRAL 79', referencia: 'URSULA TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 115, colorAccion: 'red' },
    { id: '080', banca: 'LA CENTRAL 80', referencia: 'VICTOR TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 116, colorAccion: 'brown' },
    { id: '081', banca: 'LA CENTRAL 81', referencia: 'WENDY TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 117, colorAccion: 'gray' },
    { id: '082', banca: 'LA CENTRAL 82', referencia: 'XAVIER TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 118, colorAccion: 'blue' },
    { id: '083', banca: 'LA CENTRAL 83', referencia: 'YOLANDA TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 119, colorAccion: 'green' },
    { id: '084', banca: 'LA CENTRAL 84', referencia: 'ZULEMA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 120, colorAccion: 'orange' },
    { id: '085', banca: 'LA CENTRAL 85', referencia: 'ABEL TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 121, colorAccion: 'purple' },
    { id: '086', banca: 'LA CENTRAL 86', referencia: 'BETTY TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 122, colorAccion: 'red' },
    { id: '087', banca: 'LA CENTRAL 87', referencia: 'CARLOS TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 123, colorAccion: 'brown' },
    { id: '088', banca: 'LA CENTRAL 88', referencia: 'DORA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 124, colorAccion: 'gray' },
    { id: '089', banca: 'LA CENTRAL 89', referencia: 'ENRIQUE TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 125, colorAccion: 'blue' },
    { id: '090', banca: 'LA CENTRAL 90', referencia: 'FLORENCIA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 126, colorAccion: 'green' },
    { id: '091', banca: 'LA CENTRAL 91', referencia: 'GONZALO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 127, colorAccion: 'orange' },
    { id: '092', banca: 'LA CENTRAL 92', referencia: 'HILDA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 128, colorAccion: 'purple' },
    { id: '093', banca: 'LA CENTRAL 93', referencia: 'ISMAEL TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 129, colorAccion: 'red' },
    { id: '094', banca: 'LA CENTRAL 94', referencia: 'JOSEFINA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 130, colorAccion: 'brown' },
    { id: '095', banca: 'LA CENTRAL 95', referencia: 'KARLOS TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 131, colorAccion: 'gray' },
    { id: '096', banca: 'LA CENTRAL 96', referencia: 'LILIANA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 132, colorAccion: 'blue' },
    { id: '097', banca: 'LA CENTRAL 97', referencia: 'MARTIN TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 133, colorAccion: 'green' },
    { id: '098', banca: 'LA CENTRAL 98', referencia: 'NORA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 134, colorAccion: 'orange' },
    { id: '099', banca: 'LA CENTRAL 99', referencia: 'ORLANDO TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 135, colorAccion: 'purple' },
    { id: '100', banca: 'LA CENTRAL 100', referencia: 'PAOLA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 136, colorAccion: 'red' },
    { id: '102', banca: 'LA CENTRAL 102', referencia: 'RICARDO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 137, colorAccion: 'brown' },
    { id: '103', banca: 'LA CENTRAL 103', referencia: 'SANDRA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 138, colorAccion: 'gray' },
    { id: '104', banca: 'LA CENTRAL 104', referencia: 'TULIO TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 139, colorAccion: 'blue' },
    { id: '105', banca: 'LA CENTRAL 105', referencia: 'URSULA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 140, colorAccion: 'green' },
    { id: '106', banca: 'LA CENTRAL 106', referencia: 'VICTORIA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 141, colorAccion: 'orange' },
    { id: '107', banca: 'LA CENTRAL 107', referencia: 'WILSON TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 142, colorAccion: 'purple' },
    { id: '108', banca: 'LA CENTRAL 108', referencia: 'XIMENA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 143, colorAccion: 'red' },
    { id: '109', banca: 'LA CENTRAL 109', referencia: 'YOLANDA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 144, colorAccion: 'brown' },
    { id: '110', banca: 'LA CENTRAL 110', referencia: 'ZACARIAS TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 145, colorAccion: 'gray' },
    { id: '111', banca: 'LA CENTRAL 111', referencia: 'ADRIANA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 146, colorAccion: 'blue' },
    { id: '112', banca: 'LA CENTRAL 112', referencia: 'BRUNO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 147, colorAccion: 'green' },
    { id: '113', banca: 'LA CENTRAL 113', referencia: 'CLAUDIA TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 148, colorAccion: 'orange' },
    { id: '114', banca: 'LA CENTRAL 114', referencia: 'DIEGO TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 149, colorAccion: 'purple' },
    { id: '115', banca: 'LA CENTRAL 115', referencia: 'ESTELA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 150, colorAccion: 'red' },
    { id: '116', banca: 'LA CENTRAL 116', referencia: 'FABIO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 151, colorAccion: 'brown' },
    { id: '117', banca: 'LA CENTRAL 117', referencia: 'GABRIELA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 152, colorAccion: 'gray' },
    { id: '118', banca: 'LA CENTRAL 118', referencia: 'HECTOR TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 153, colorAccion: 'blue' },
    { id: '120', banca: 'LA CENTRAL 120', referencia: 'IRENE TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 154, colorAccion: 'green' },
    { id: '121', banca: 'LA CENTRAL 121', referencia: 'JAVIER TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 155, colorAccion: 'orange' },
    { id: '122', banca: 'LA CENTRAL 122', referencia: 'KARINA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 156, colorAccion: 'purple' },
    { id: '123', banca: 'LA CENTRAL 123', referencia: 'LEONARDO TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 157, colorAccion: 'red' },
    { id: '124', banca: 'LA CENTRAL 124', referencia: 'MIRIAM TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 158, colorAccion: 'brown' },
    { id: '125', banca: 'LA CENTRAL 125', referencia: 'NICOLAS TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 159, colorAccion: 'gray' },
    { id: '126', banca: 'LA CENTRAL 126', referencia: 'OLIVIA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 160, colorAccion: 'blue' },
    { id: '127', banca: 'LA CENTRAL 127', referencia: 'PABLO TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 161, colorAccion: 'green' },
    { id: '128', banca: 'LA CENTRAL 128', referencia: 'QUERIDA TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 162, colorAccion: 'orange' },
    { id: '129', banca: 'LA CENTRAL 129', referencia: 'RAMON TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 163, colorAccion: 'purple' },
    { id: '130', banca: 'LA CENTRAL 130', referencia: 'SILVIA TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 164, colorAccion: 'red' },
    { id: '131', banca: 'LA CENTRAL 131', referencia: 'TOMAS TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 165, colorAccion: 'brown' },
    { id: '132', banca: 'LA CENTRAL 132', referencia: 'URSULA TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 166, colorAccion: 'gray' },
    { id: '133', banca: 'LA CENTRAL 133', referencia: 'VICTOR TL', requiereCambio: false, zona: 'GRUPO GUYANA (EL GUARDIA)', numeroAccion: 167, colorAccion: 'blue' },
    { id: '134', banca: 'LA CENTRAL 134', referencia: 'WENDY TL', requiereCambio: true, zona: 'GRUPO GUYANA (COGNON)', numeroAccion: 168, colorAccion: 'green' },
    { id: '136', banca: 'LA CENTRAL 136', referencia: 'XAVIER TL', requiereCambio: false, zona: 'GRUPO GUYANA (ROSA KOUROU)', numeroAccion: 169, colorAccion: 'orange' },
    { id: '137', banca: 'LA CENTRAL 137', referencia: 'YOLANDA TL', requiereCambio: true, zona: 'GUYANA (JUDELAINE)', numeroAccion: 170, colorAccion: 'purple' },
    { id: '138', banca: 'LA CENTRAL 138', referencia: 'ZULEMA TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 171, colorAccion: 'red' },
    { id: '139', banca: 'LA CENTRAL 139', referencia: 'ABEL TL', requiereCambio: true, zona: 'GRUPO KENDRICK TL', numeroAccion: 172, colorAccion: 'brown' },
    { id: '140', banca: 'LA CENTRAL 140', referencia: 'BETTY TL', requiereCambio: false, zona: 'GRUPO GILBERTO TL', numeroAccion: 173, colorAccion: 'gray' },
    { id: '141', banca: 'LA CENTRAL 141', referencia: 'CARLOS TL', requiereCambio: true, zona: 'GRUPO GUYANA (JHON)', numeroAccion: 174, colorAccion: 'blue' },
    { id: '142', banca: 'LA CENTRAL 142', referencia: 'DORA TL', requiereCambio: false, zona: 'GRUPO GUYANA (OMAR)', numeroAccion: 175, colorAccion: 'green' },
    { id: '143', banca: 'LA CENTRAL 143', referencia: 'ENRIQUE TL', requiereCambio: true, zona: 'GRUPO GUYANA (DANI)', numeroAccion: 176, colorAccion: 'orange' }
  ];

  const zonas = [
    'GRUPO GUYANA (JHON)',
    'GRUPO KENDRICK TL',
    'GRUPO GILBERTO TL',
    'GRUPO GUYANA (OMAR)',
    'GRUPO GUYANA (DANI)',
    'GRUPO GUYANA (EL GUARDIA)',
    'GRUPO GUYANA (COGNON)',
    'GRUPO GUYANA (ROSA KOUROU)',
    'GUYANA (JUDELAINE)',
  ];

  // Filtrar usuarios por zonas seleccionadas y filtro rápido
  const filteredUsuarios = usuarios.filter(user => {
    const matchesZone = selectedZones.length === 0 || selectedZones.includes(user.zona);
    const matchesQuickFilter = !quickFilter || 
      user.id.toLowerCase().includes(quickFilter.toLowerCase()) ||
      user.banca.toLowerCase().includes(quickFilter.toLowerCase()) ||
      user.referencia.toLowerCase().includes(quickFilter.toLowerCase());
    
    return matchesZone && matchesQuickFilter;
  });

  const itemsPerPage = entriesPerPage === 'todos' ? filteredUsuarios.length : entriesPerPage;
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedUsuarios = filteredUsuarios.slice(startIndex, startIndex + itemsPerPage);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    setCurrentPage(1);
    // Los filtros ya se aplican automáticamente por el estado
  };

  // Función para manejar selección de zonas
  const handleZoneToggle = (zona) => {
    if (selectedZones.includes(zona)) {
      setSelectedZones(selectedZones.filter(z => z !== zona));
    } else {
      setSelectedZones([...selectedZones, zona]);
    }
  };

  // Función para seleccionar/deseleccionar todas las zonas
  const handleSelectAllZones = () => {
    if (selectedZones.length === zonas.length) {
      setSelectedZones([]);
    } else {
      setSelectedZones([...zonas]);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.multiselect-dropdown')) {
        setShowZoneDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePassword = (username) => {
    setSelectedUsername(username);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUsername('');
  };

  return (
    <div className="user-bancas-container">
      <div className="user-bancas-card">
        <div className="user-bancas-card-header">
          <h3 className="user-bancas-header-text">Lista de usuarios</h3>
        </div>

        <div className="user-bancas-card-body">
          {/* Formulario de Filtros */}
          <form className="user-bancas-form" onSubmit={(e) => e.preventDefault()}>
            <div className="user-bancas-form-row">
              <div className="user-bancas-form-col-6">
                <fieldset className="user-bancas-fieldset">
                  <legend className="user-bancas-legend">Zonas</legend>
                  <div className="multiselect-dropdown">
                    <div 
                      className="multiselect-tags" 
                      onClick={() => setShowZoneDropdown(!showZoneDropdown)}
                    >
                      <span className="user-bancas-multiselect-text">
                        {selectedZones.length} seleccionadas
                      </span>
                      <span className="multiselect-arrow">▼</span>
                    </div>
                    
                    {showZoneDropdown && (
                      <div className="multiselect-options">
                        <div className="multiselect-option" onClick={handleSelectAllZones}>
                          <input 
                            type="checkbox" 
                            checked={selectedZones.length === zonas.length}
                            readOnly
                          />
                          <span>Todos</span>
                        </div>
                        {zonas.map(zona => (
                          <div 
                            key={zona}
                            className="multiselect-option" 
                            onClick={() => handleZoneToggle(zona)}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedZones.includes(zona)}
                              readOnly
                            />
                            <span>{zona}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>

              <div className="user-bancas-form-col-4">
                <fieldset className="user-bancas-fieldset">
                  <button 
                    type="button" 
                    className="user-bancas-btn-filter"
                    onClick={aplicarFiltros}
                  >
                    FILTRAR
                  </button>
                </fieldset>
              </div>
            </div>
          </form>

          {/* Controles de Tabla */}
          <div className="user-bancas-table-controls">
            <div className="user-bancas-controls-container">
              <div className="user-bancas-page-select-wrapper">
                <label className="user-bancas-label">Entradas por página</label>
                <select 
                  className="user-bancas-select"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value="todos">Todos</option>
                </select>
              </div>

              <div className="user-bancas-quick-filter-wrapper">
                <div className="user-bancas-input-group">
                  <input 
                    type="text"
                    placeholder="Filtrado rápido"
                    className="user-bancas-input"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="user-bancas-btn-clear"
                    style={{opacity: quickFilter ? 1 : 0.5}}
                    disabled={!quickFilter}
                    onClick={() => setQuickFilter('')}
                  >
                    <svg width="16" height="16" viewBox="0 0 640 512" fill="currentColor">
                      <path d="M576 64H205.26A63.97 63.97 0 0 0 160 82.75L9.37 233.37c-12.5 12.5-12.5 32.76 0 45.25L160 429.25c12 12 28.28 18.75 45.25 18.75H576c35.35 0 64-28.65 64-64V128c0-35.35-28.65-64-64-64zm-84.69 254.06c6.25 6.25 6.25 16.38 0 22.63l-22.62 22.62c-6.25 6.25-16.38 6.25-22.63 0L384 301.25l-62.06 62.06c-6.25 6.25-16.38 6.25-22.63 0l-22.62-22.62c-6.25-6.25-6.25-16.38 0-22.63L338.75 256l-62.06-62.06c-6.25-6.25-6.25-16.38 0-22.63l22.62-22.62c6.25-6.25 16.38-6.25 22.63 0L384 210.75l62.06-62.06c6.25-6.25 16.38-6.25 22.63 0l22.62 22.62c6.25 6.25 6.25 16.38 0 22.63L429.25 256l62.06 62.06z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="user-bancas-table-responsive">
            <table className="user-bancas-table">
              <thead className="user-bancas-thead">
                <tr>
                  <th className="user-bancas-th">Usuario</th>
                  <th className="user-bancas-th">Banca</th>
                  <th className="user-bancas-th">Referencia</th>
                  <th className="user-bancas-th">Requiere cambio de contraseña</th>
                  <th className="user-bancas-th">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {displayedUsuarios.map((usuario, index) => (
                  <tr key={usuario.id} className={index % 2 === 0 ? "user-bancas-tr-even" : "user-bancas-tr-odd"}>
                    <td className="user-bancas-td">{usuario.id}</td>
                    <td className="user-bancas-td">{usuario.banca}</td>
                    <td className="user-bancas-td">{usuario.referencia}</td>
                    <td className="user-bancas-td">
                      {usuario.requiereCambio && (
                        <span className="check-icon">✓</span>
                      )}
                    </td>
                    <td className="user-bancas-td">
                      <button 
                        type="button"
                        className="user-bancas-btn-action btn-password"
                        onClick={() => handlePassword(usuario.id)}
                        title="Cambiar contraseña"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="user-bancas-pagination-container">
            <div className="user-bancas-pagination-info">
              Mostrando {displayedUsuarios.length} de {filteredUsuarios.length} entradas
            </div>
            <div>
              <ul className="user-bancas-pagination">
                <li className={`user-bancas-page-item ${currentPage === 1 ? 'user-bancas-page-item-disabled' : ''}`}>
                  <a 
                    className="user-bancas-page-link"
                    onClick={() => currentPage > 1 && setCurrentPage(1)}
                  >«</a>
                </li>
                <li className={`user-bancas-page-item ${currentPage === 1 ? 'user-bancas-page-item-disabled' : ''}`}>
                  <a 
                    className="user-bancas-page-link"
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  >‹</a>
                </li>
                {[1, 2, 3, 4].map(pageNum => (
                  <li 
                    key={pageNum}
                    className={`user-bancas-page-item ${currentPage === pageNum ? 'user-bancas-page-item-active' : ''}`}
                  >
                    <a 
                      className="user-bancas-page-link"
                      onClick={() => setCurrentPage(pageNum)}
                    >{pageNum}</a>
                  </li>
                ))}
                <li className={`user-bancas-page-item ${currentPage === 4 ? 'user-bancas-page-item-disabled' : ''}`}>
                  <a 
                    className="user-bancas-page-link"
                    onClick={() => currentPage < 4 && setCurrentPage(currentPage + 1)}
                  >›</a>
                </li>
                <li className={`user-bancas-page-item ${currentPage === 4 ? 'user-bancas-page-item-disabled' : ''}`}>
                  <a 
                    className="user-bancas-page-link"
                    onClick={() => currentPage < 4 && setCurrentPage(4)}
                  >»</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contraseña */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        username={selectedUsername}
      />
    </div>
  );
};

export default UserBancas;
