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

function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function send_plain_mail($to, $subject, $body, $replyTo = "") {
    $headers = "From: Kremisi <no-reply@kremisi.com>\r\n";

    if (!empty($replyTo) && is_valid_email($replyTo)) {
        $headers .= "Reply-To: $replyTo\r\n";
    }

    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["success" => true, "message" => "Email sent successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Error sending email"]);
    }

    exit;
}

$kind = sanitize($_POST["kind"] ?? "");

if ($kind === "website-roaster") {
    $url = sanitize($_POST["url"] ?? "");
    $normalizedUrl = sanitize($_POST["normalizedUrl"] ?? "");
    $hostname = sanitize($_POST["hostname"] ?? "");
    $status = sanitize($_POST["status"] ?? "error");
    $error = sanitize($_POST["error"] ?? "");
    $roastPreview = sanitize($_POST["roastPreview"] ?? "");
    $timestamp = sanitize($_POST["timestamp"] ?? "");

    if (empty($url) && empty($normalizedUrl)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "URL is required."]);
        exit;
    }

    $resolvedSite = !empty($normalizedUrl) ? $normalizedUrl : $url;
    $resolvedHost = !empty($hostname) ? $hostname : parse_url($resolvedSite, PHP_URL_HOST);
    $statusLabel = strtolower($status) === "success" ? "success" : "error";

    $subject = sprintf(
        "Website Roaster scan: %s [%s]",
        $resolvedHost ?: "unknown-host",
        $statusLabel
    );

    $body = "Website Roaster notification:\n\n";
    $body .= "Status: $statusLabel\n";
    $body .= "Submitted URL: " . ($url ?: "N/A") . "\n";
    $body .= "Scanned URL: " . ($normalizedUrl ?: "N/A") . "\n";
    $body .= "Hostname: " . ($resolvedHost ?: "N/A") . "\n";
    $body .= "Timestamp: " . ($timestamp ?: gmdate('c')) . "\n";

    if (!empty($error)) {
        $body .= "\nError:\n$error\n";
    }

    if (!empty($roastPreview)) {
        $body .= "\nRoast preview:\n$roastPreview\n";
    }

    send_plain_mail("info@kremisi.com", $subject, $body);
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
if (!is_valid_email($email)) $errors[] = "Invalid email.";

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

send_plain_mail($to, $subject, $body, $email);
?>
