<?php
$configs = require 'config.php';

/**
 * Définition des constantes utilisées pour le script cron
 */
if (!defined('SERVEUR')) define('SERVEUR', $configs['serveur']);
if (!defined('USER')) define('USER', $configs['user']);
if (!defined('DATABASE')) define('DATABASE', $configs['database']);
// if (isset($configs['port']) && !defined('PORT')) define('PORT', $configs['port']);
if (!defined('MDP')) define('MDP', $configs['password']);
if (!defined('API_RTE_AUTH_KEY')) define('API_RTE_AUTH_KEY', $configs['api_rte_auth_key']);
if (!defined('SEUIL_COM')) define('SEUIL_COM', $configs['seuil_alerte_communication']);
if (!defined('SEUIL_GROUPE')) define('SEUIL_GROUPE', $configs['seuil_alerte_groupe']);
if (!defined('SEUIL_USinE')) define('SEUIL_USINE', $configs['seuil_alerte_usine']);
if (!defined('INTERNAL_API_REQUEST')) define('INTERNAL_API_REQUEST', $configs['internal_api_token']);
if (!defined('URL_SITE_PROD')) define('URL_SITE_PROD', $configs['site_url']);
if (!defined('PAGES_PRIX')) define('PAGES_PRIX', $configs['pages_prix']);

/**
 * Connexion à la base de données
 *
 * @return PDO
 */
function connectPDO(): PDO
{
   $hote = SERVEUR;
   $db = DATABASE;
   if (defined('PORT')) {
      //$port = PORT;
      return new PDO("mysql:host={$hote};dbname={$db};charset=utf8", USER, MDP);
   }
   return new PDO("mysql:host={$hote};dbname={$db};charset=utf8", USER, MDP);
}




/**
 * Instancie PDO, lance la requête sur la bdd et retourne le résultat
 */
abstract class QueryPDO
{
   /**
    * @var PDO
    */
   protected $pdo;
   protected $resultats;

   public function __construct()
   {
      try {
         $this->pdo = connectPDO();
         $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
         $this->resultats = $this->query();
         $this->pdo = null;
      } catch (PDOException $e) {
         echo 'Échec lors de la connexion : ' . $e->getMessage();
      }
   }

   /**
    * Effectue la requête
    *
    * @return mixed
    */
   protected abstract function query();

   /**
    * Résultats de la requête
    *
    * @return mixed
    */
   public function getResultats()
   {
      return $this->resultats;
   }
}


/**
 * Classe chargée de la construction de la structure de base d'un mail et de son envoi
 */
abstract class Mail
{
   protected string $destEmail;
   protected string $message;
   protected string $sujet;
   protected array $headers;


   /**
    * Prépare le message à être envoyé à un destinataire
    */
   public function __construct()
   {
      $this->message = $this->setMessage();
      $this->sujet = $this->setSujet();
      $this->headers = [];
      $this->headers[] = 'MIME-Version: 1.0';
      $this->headers[] = 'Content-type: text/html; charset=utf-8';
   }

   /**
    * Fixe le msgTransmission du message
    *
    * @return string
    */
   abstract protected function setMessage(): string;

   /**
    * Fixe le sujet du message
    *
    * @return string
    */
   abstract protected function setSujet(): string;

   /**
    * Fixe le destinataire
    *
    * @param string $email
    * @return void
    */
   public function setDestinataire(string $email)
   {
      $this->destEmail = $email;
   }

   /**
    * Envoie le message
    *
    * @return bool
    */
   public function envoyer(): bool
   {
      $this->headers[] = "To: {$this->destEmail}";
      $this->headers[] = 'From: Energies Maintenance - Production <Webmaster@energiesmaintenance.com>';
      return mail($this->destEmail, $this->sujet, $this->message, implode("\r\n", $this->headers));
   }
}
