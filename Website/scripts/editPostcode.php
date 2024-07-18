<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

// Get request body and assign to variable
$json = file_get_contents("php://input");
$object = "";
if($json != "")
{
    $object = json_decode($json);
    $postcode = $object->request->postcode;
    $postcodeID = $object->request->postcodeID;
}
else 
{
    $dataSent = "No Data Entered";
}

try
{
    // Database credentials
    $servername = "localhost";
    $database = "c2318770_postcodeDB";
    $username = "c2318770_admin";
    $password = "M@th3w123";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $database);

    // Check connection
    $result = "OK";
    if($conn -> connect_error)
    {
        die(json_encode(["error" => $conn->connect_error]));
    }

    // Database call
    $prepared = $conn -> prepare("UPDATE tbl_postcodes SET postcode = ? WHERE postcodeID = ?");
    $prepared -> bind_param("si", $postcode, $postcodeID);
    $prepared -> execute();
    $conn->close();
}
catch(Exception $e)
{
    // Return error
    $BuildResult = [];
    $BuildResult["Message"] = $e->getMessage();
    echo json_encode($BuildResult);
}
