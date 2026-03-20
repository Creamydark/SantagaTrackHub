<img width="1920" height="1080" alt="{B8D4F6C1-5E2C-484B-A770-3FA7E962002E}" src="https://github.com/user-attachments/assets/39a6176b-b9df-4290-b1da-7880b9f185ac" />
# SantagaTrackHub 📍🏥

**A Web-Based Arduino Tracking System for Utility and Non-Emergency Vehicles in Barangay Santiago, General Trias**

SantagaTrackHub is a unified management system designed to modernize local government operations. It bridges logistics and public health by combining real-time IoT vehicle tracking with a secure, QR-coded digital health record system. 

## 🚀 Features

* **Real-Time Vehicle Tracking:** Live map monitoring of barangay utility and non-emergency vehicles using Arduino-based GPS and GSM modules.
* **QR-Based Driver Logging:** Automated recording of driver identity, dispatch time, and vehicle usage duration via QR code scanning.
* **Digital Health Records:** Secure storage and instant retrieval of patient medical histories and vaccination data using unique QR codes.
* **Unified Web Dashboard:** A centralized platform for barangay officials and health workers to coordinate operations and resources effectively.

## 🛠️ Tech Stack

**Software (Web Application)**
* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** PHP
* **Database:** MySQL

**Hardware (IoT Tracking Unit)**
* **Microcontroller:** Arduino Uno
* **Location:** Neo-6M GPS Module
* **Network/Transmission:** SIM800L GSM Module
* **Power:** External Power Supply

## ⚙️ Hardware Setup

The tracking device requires the following general wiring setup:
1. **Neo-6M GPS** connected to the Arduino for acquiring geographical coordinates.
2. **SIM800L GSM** connected to the Arduino to transmit the parsed GPS data to the web server's endpoint via HTTP GET/POST requests.
3. Ensure the SIM800L is supplied with sufficient power (typically requires a dedicated power source separate from the Arduino's 5V pin to handle transmission spikes).

## 💻 Installation & Setup

### Web Application
1. Clone this repository to your local machine:
   `git clone https://github.com/yourusername/SantagaTrackHub.git`
2. Move the project folder to your local server directory (e.g., `htdocs` for XAMPP).
3. Create a new MySQL database named `santagatrackhub_db`.
4. Import the provided `database.sql` file into your MySQL database.
5. Update the database connection settings in the PHP configuration file (e.g., `config.php` or `db_connect.php`).

### Arduino Unit
1. Open the Arduino IDE.
2. Install the necessary libraries (e.g., `TinyGPS++`, `SoftwareSerial`).
3. Open the `tracker_sketch.ino` file located in the `/arduino` directory of this repo.
4. Update the GPRS APN settings and the target server URL in the code to point to your hosted PHP endpoint.
5. Compile and upload the code to the Arduino Uno.

## 👥 Authors / Researchers

* **Brixter C. Alonzo**
* **Marc Luis N. Segunto**
* **Mark Kenneth A. Uy**
* **Rhay Justin A. Sampaga**

BSIT 3-3 | Cavite State University - General Trias Campus
