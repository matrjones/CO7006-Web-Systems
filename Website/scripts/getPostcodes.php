<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

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
    $sql = "SELECT * FROM tbl_postcodes";
    $result = $conn->query($sql);
    $BuildResult = [];

    // Return response
    if($result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            $RowItem = [];
            $RowItem["postcodeID"] = $row["postcodeID"];
            $RowItem["postcode"] = $row["postcode"];
            $BuildResult[] = $RowItem;
        }
    }
    else
    {
        $BuildResult["Error"] = "No Results";
    }
    $conn->close();
    echo json_encode($BuildResult);
}
catch(Exception $e)
{
    // Return error
    $BuildResult = [];
    $BuildResult["Message"] = $e->getMessage();
    echo json_encode($BuildResult);
}
