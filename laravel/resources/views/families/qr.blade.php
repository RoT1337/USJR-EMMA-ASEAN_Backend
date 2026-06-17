<!DOCTYPE html>
<html>
<head>
    <title>{{ $family->name }} QR Code</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        .qr-wrapper {
            margin: 40px auto;
        }
        .qr-corner {
            width: 50px;
            height: 50px;
            text-align: center;
            position: absolute;
            background-color: white;
            color: transparent;
            font-size: 10px;
            pointer-events: none;
            user-select: none;
        }
        .qr-corner-0 { top: 20px; left: 20px; }
        .qr-corner-1 { top: 20px; right: 20px; }
        .qr-corner-2 { bottom: 20px; left: 20px; }
        .qr-corner-3 { bottom: 20px; right: 20px; }
        .qr-container {
            width: 362px;
            display: inline-block;
            position: relative;
        }
        @media (min-width: 768px) {
            .qr-container {
                width: 362px;
            }
        }
        @media (max-width: 767px) {
            .qr-container {
                width: 320px;
            }
        }
    </style>
</head>
<body>
    <div class="qr-wrapper">
        <div class="qr-corner qr-corner-0">WX</div>
        <div class="qr-corner qr-corner-1">LB</div>
        <div class="qr-corner qr-corner-2">BC</div>
        <div class="qr-corner qr-corner-3">UP</div>
        <div class="qr-container">
            <img src="data:image/png;base64,{{ $qrBase64 }}" alt="QR Code" />
        </div>
        <p style="text-align: center; margin-top: 20px;">
            Scan this QR code in your React Native app to join this family
        </p>
        <div style="text-align: center; margin-top: 20px;">
            <a href="{{ route('api.family.qr', $family->id) }}" download="family-qr.png">Download QR Code</a>
        </div>
    </div>
</body>
</html>
