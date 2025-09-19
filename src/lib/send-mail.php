<?php
// Imposta l'header per JSON (utile se vuoi ricevere risposta in JS)
header("Content-Type: application/json");

// Permetti solo POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

// Sanitizzazione helper
function sanitize($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Leggi i campi
$service  = sanitize($_POST["service"] ?? "");
$budget   = sanitize($_POST["budget"] ?? "");
$delivery = sanitize($_POST["delivery"] ?? "");
$details  = sanitize($_POST["details"] ?? "");
$name     = sanitize($_POST["name"] ?? "");
$company  = sanitize($_POST["company"] ?? "");
$email    = filter_var($_POST["email"] ?? "", FILTER_SANITIZE_EMAIL);
$phone    = sanitize($_POST["phone"] ?? "");

// Validazioni
$errors = [];

if (empty($service))  $errors[] = "Service is required.";
if (empty($budget))   $errors[] = "Budget is required.";
if (empty($delivery)) $errors[] = "Delivery is required.";
if (empty($details))  $errors[] = "Details are required.";
if (empty($name))     $errors[] = "Name is required.";
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Invalid email.";

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(["success" => false, "errors" => $errors]);
    exit;
}

// Prepara la mail
$to = "info@kremisi.com"; // Cambia con il tuo indirizzo
$subject = "New contact from Kremisi";

$body = "
You have received a new contact request:

Service: $service
Budget: $budget
Delivery: $delivery
Details: $details

Name: $name
Company: $company
Email: $email
Phone: $phone
";

$headers = "From: Kremisi <no-reply@kremisi.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Invia
if (mail($to, $subject, $body, $headers)) {
    echo json_encode(["success" => true, "message" => "Email sent successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Error sending email"]);
}

?>