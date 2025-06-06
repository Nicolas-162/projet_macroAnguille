<?php
function connectPDO() {
    try {
        // Define the DSN (Data Source Name)
        $dsn = 'macroAnguilleDB'; // The name of the ODBC data source you created
        $username = 'root'; // MySQL username
        $password = ''; // MySQL password

        // Create a PDO connection
        $pdo = new PDO("odbc:$dsn", $username, $password);

        // Set error mode to exception
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $pdo;
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}
?>