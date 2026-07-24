require('dotenv').config();
const mongoose = require('mongoose');

const rawQuestions = [
  "What does the C in CIA triad stand for?|Confidentiality|Control|Certification|Centralization",
  "What does the I in CIA triad stand for?|Integrity|Integration|Identification|Intelligence",
  "What does the A in CIA triad stand for?|Availability|Authentication|Authorization|Accountability",
  "Which concept ensures that data is not altered in transit?|Integrity|Confidentiality|Availability|Non-repudiation",
  "Which concept ensures that data is only accessible to authorized users?|Confidentiality|Integrity|Availability|Authentication",
  "Which concept ensures that systems and data are accessible when needed?|Availability|Confidentiality|Integrity|Non-repudiation",
  "What is the process of verifying a user's identity?|Authentication|Authorization|Accounting|Auditing",
  "What is the process of granting permissions to an authenticated user?|Authorization|Authentication|Accounting|Auditing",
  "Which model has 7 layers?|OSI Model|TCP/IP Model|DoD Model|Network Model",
  "Which model has 4 layers?|TCP/IP Model|OSI Model|ISO Model|IEEE Model",
  "What is the first layer of the OSI model?|Physical|Data Link|Network|Transport",
  "What is the second layer of the OSI model?|Data Link|Physical|Network|Transport",
  "What is the third layer of the OSI model?|Network|Data Link|Transport|Session",
  "What is the fourth layer of the OSI model?|Transport|Network|Session|Presentation",
  "What is the fifth layer of the OSI model?|Session|Transport|Presentation|Application",
  "What is the sixth layer of the OSI model?|Presentation|Session|Application|Transport",
  "What is the seventh layer of the OSI model?|Application|Presentation|Session|Transport",
  "Which layer of the OSI model handles IP addressing?|Network|Data Link|Transport|Physical",
  "Which layer of the OSI model handles MAC addressing?|Data Link|Physical|Network|Transport",
  "Which layer of the OSI model handles end-to-end reliability (TCP/UDP)?|Transport|Network|Session|Application",
  "Which protocol is connection-oriented and reliable?|TCP|UDP|IP|ICMP",
  "Which protocol is connectionless and faster but unreliable?|UDP|TCP|IP|ARP",
  "What does SSID stand for?|Service Set Identifier|Secure Set Identifier|Service System ID|Secure System ID",
  "What is an Access Point (AP) used for?|Connecting wireless devices to a wired network|Storing databases|Filtering web traffic|Cooling the network room",
  "What frequency band does 802.11b use?|2.4 GHz|5 GHz|6 GHz|900 MHz",
  "What frequency band does 802.11a use?|5 GHz|2.4 GHz|6 GHz|900 MHz",
  "Which wireless security protocol is the weakest and easily crackable?|WEP|WPA|WPA2|WPA3",
  "What encryption algorithm did WEP use?|RC4|AES|DES|RSA",
  "What encryption did WPA primarily use to improve upon WEP?|TKIP|AES|DES|RC4",
  "What encryption standard does WPA2 mandate?|AES|TKIP|RC4|DES",
  "Which is the most recent and secure Wi-Fi security protocol?|WPA3|WPA2|WPA|WEP",
  "What does WPA3 introduce to protect against dictionary attacks?|SAE (Simultaneous Authentication of Equals)|TKIP|AES|CCMP",
  "What attack involves setting up a rogue access point with the same SSID as a legitimate one?|Evil Twin|DoS|SQL Injection|Buffer Overflow",
  "What attack intercepts communication between two parties without their knowledge?|Man in the Middle (MitM)|Phishing|DoS|Ransomware",
  "What attack overwhelms a network or service, making it unavailable to users?|Denial of Service (DoS)|Evil Twin|MitM|Spoofing",
  "What is the act of driving around searching for open or vulnerable wireless networks?|Wardriving|Shoulder surfing|Piggybacking|Tailgating",
  "What is it called when an unauthorized user connects to someone else's wireless network without permission?|Piggybacking|Phishing|Spoofing|Wardriving",
  "What type of attack involves looking over someone's shoulder to steal credentials?|Shoulder surfing|Phishing|Eavesdropping|Wardriving",
  "What tool is used to monitor incoming and outgoing network traffic based on security rules?|Firewall|Router|Switch|Hub",
  "What does VPN stand for?|Virtual Private Network|Virtual Public Network|Visual Private Network|Verified Private Network",
  "What is the primary purpose of a VPN?|To encrypt data over a public network|To increase internet speed|To block all incoming traffic|To host a website",
  "Which system detects unauthorized access attempts but does not block them?|IDS (Intrusion Detection System)|IPS|Firewall|Antivirus",
  "Which system detects and actively blocks unauthorized access attempts?|IPS (Intrusion Prevention System)|IDS|Firewall|Antivirus",
  "What does NAC stand for?|Network Access Control|Network Authorization Center|National Access Control|Network Administration Center",
  "Which technology uses radio waves to passively identify a tagged object?|RFID|NFC|Bluetooth|Wi-Fi",
  "What is a major privacy concern with RFID tags?|Unauthorized tracking|High power consumption|Slow data transfer|Frequent battery replacement",
  "What does NFC stand for?|Near Field Communication|Network Frequency Control|National Field Communication|New Field Connection",
  "What is the typical maximum range of NFC?|A few centimeters|10 meters|100 meters|1 kilometer",
  "What protocol is widely used for voice communications over the internet?|VoIP|FTP|SMTP|POP3",
  "What does VoIP stand for?|Voice over Internet Protocol|Voice over Internal Protocol|Video over Internet Protocol|Virtual over IP",
  "Which challenge is most critical for VoIP and real-time multimedia?|Latency (Delay)|Storage space|File size|Database indexing",
  "What is jitter in a network?|Variation in packet delay|Complete loss of connection|High bandwidth|A type of malware",
  "What happens during packet loss in a VoIP call?|Audio may drop out or skip|The call is immediately disconnected|The call is encrypted|The audio becomes louder",
  "What mechanism prioritizes critical network traffic (like VoIP) over regular traffic?|QoS (Quality of Service)|NAC|VPN|WEP",
  "What is the term for a malicious attempt to disrupt a VoIP service by flooding it with packets?|VoIP DoS|Phishing|SQL Injection|Ransomware",
  "What is 'vishing'?|Voice phishing|Video phishing|Virtual phishing|Visual phishing",
  "Which authentication factor is 'something you know'?|Password|Fingerprint|Smart card|Retina scan",
  "Which authentication factor is 'something you have'?|Smart card|Password|PIN|Fingerprint",
  "Which authentication factor is 'something you are'?|Fingerprint|Password|Smart card|Token",
  "Using a password and a code sent to your phone is an example of:|Two-Factor Authentication (2FA)|Single-Factor Authentication|Biometrics|Authorization",
  "Which term describes concealing the identity of a user or device on a network?|Anonymity|Integrity|Availability|Accountability",
  "What technique is used to hide a message inside another seemingly harmless file?|Steganography|Cryptography|Hashing|Encoding",
  "What is Cryptography primarily used for?|Securing communications|Speeding up networks|Compressing files|Designing websites",
  "What does malware stand for?|Malicious Software|Malfunctioning Hardware|Malware Ware|Main Software",
  "What type of malware demands payment to restore access to data?|Ransomware|Adware|Spyware|Trojan",
  "What type of malware secretly monitors user activity?|Spyware|Ransomware|Worm|Virus",
  "What malware disguises itself as legitimate software?|Trojan Horse|Worm|Spyware|Adware",
  "What malware replicates itself across networks without user intervention?|Worm|Trojan|Virus|Spyware",
  "What is a Botnet?|A network of compromised computers controlled by an attacker|A network of corporate servers|A legitimate search engine bot|A type of antivirus",
  "What attack is a botnet most commonly used for?|DDoS (Distributed Denial of Service)|Phishing|SQL Injection|Man-in-the-Middle",
  "What does MAC stand for in networking?|Media Access Control|Memory Access Control|Main Access Control|Media Authorization Center",
  "How long is a standard MAC address?|48 bits|32 bits|128 bits|64 bits",
  "How long is an IPv4 address?|32 bits|128 bits|48 bits|64 bits",
  "How long is an IPv6 address?|128 bits|32 bits|48 bits|64 bits",
  "What protocol resolves IP addresses to MAC addresses?|ARP|DNS|DHCP|FTP",
  "What protocol resolves domain names to IP addresses?|DNS|ARP|DHCP|HTTP",
  "What protocol automatically assigns IP addresses to devices?|DHCP|DNS|ARP|FTP",
  "What is a common attack against ARP?|ARP Spoofing|DNS Spoofing|DHCP Starvation|SQL Injection",
  "What is a common attack against DNS?|DNS Cache Poisoning|ARP Spoofing|DHCP Starvation|Buffer Overflow",
  "What attack exhausts the IP address pool of a DHCP server?|DHCP Starvation|DNS Spoofing|ARP Spoofing|Phishing",
  "What does WAP stand for?|Wireless Access Point|Wired Access Point|Wireless Application Protocol|Wide Area Protocol",
  "What feature hides the wireless network name from broadcasting?|SSID Cloaking/Hiding|MAC Filtering|WEP Encryption|WPA Encryption",
  "Does hiding the SSID completely secure a wireless network?|No, it can still be discovered using network sniffers|Yes, it makes the network invisible|Yes, it encrypts all traffic|No, but it prevents DoS attacks",
  "What security measure only allows specific devices to connect based on their hardware address?|MAC Filtering|SSID Hiding|WEP|DHCP",
  "Is MAC Filtering a foolproof security measure?|No, MAC addresses can be easily spoofed|Yes, MAC addresses cannot be changed|Yes, it encrypts the connection|No, it slows down the network",
  "Which attack involves a device mimicking a legitimate access point but with a stronger signal?|Evil Twin|Wardriving|Phishing|Ransomware",
  "What tool is commonly used to capture and analyze network packets?|Wireshark|Photoshop|Microsoft Word|Excel",
  "Which cryptographic concept guarantees that the sender of a message cannot deny having sent it?|Non-repudiation|Confidentiality|Integrity|Availability",
  "Which hashing algorithm produces a 128-bit hash value and is now considered vulnerable?|MD5|SHA-256|SHA-1|AES",
  "Which hashing algorithm is widely used and considered secure today?|SHA-256|MD5|RC4|DES",
  "What is the purpose of a Salt in password hashing?|To defend against rainbow table and dictionary attacks|To encrypt the password|To make the password shorter|To speed up the hashing process",
  "Which algorithm is an example of symmetric encryption?|AES|RSA|DSA|ECC",
  "Which algorithm is an example of asymmetric encryption?|RSA|AES|DES|RC4",
  "In asymmetric encryption, what key is used to encrypt a message meant for a specific user?|The recipient's public key|The recipient's private key|The sender's public key|The sender's private key",
  "In asymmetric encryption, what key is used to decrypt a message?|The recipient's private key|The recipient's public key|The sender's private key|The sender's public key",
  "What is used to digitally sign a document in asymmetric cryptography?|The sender's private key|The sender's public key|The recipient's private key|The recipient's public key",
  "What verifies the authenticity of a digital certificate?|Certificate Authority (CA)|Domain Name System (DNS)|Internet Service Provider (ISP)|Router",
  "What does SSL/TLS primarily provide for web browsing?|Encryption and secure communication|Faster loading speeds|Virus protection|Data backup",
  "What port does HTTPS use by default?|443|80|21|22",
  "What port does HTTP use by default?|80|443|21|22",
  "What port does SSH use by default?|22|21|23|80",
  "What port does FTP use by default?|21|22|80|443",
  "What is an open port?|A network port accepting incoming connections|A physical USB port|A blocked port|A broken port",
  "What is a Honeypot?|A decoy system designed to lure attackers|A secure database|A type of firewall|A strong encryption algorithm",
  "What is the term for breaking into a system to find vulnerabilities with the owner's permission?|Ethical Hacking (Penetration Testing)|Malicious Hacking|Phishing|Social Engineering",
  "What is Social Engineering?|Manipulating people into giving up confidential information|Writing complex software|Building social networks|Configuring firewalls",
  "Which of the following is a Social Engineering attack?|Phishing|DDoS|SQL Injection|Buffer Overflow",
  "What is 'Tailgating' in security?|Following an authorized person into a restricted area without permission|Driving too close to another car|A network attack|Stealing passwords online",
  "What does BYOD stand for in a corporate environment?|Bring Your Own Device|Build Your Own Database|Bring Your Own Data|Buy Your Own Device",
  "What is a major security risk of BYOD?|Mixing personal and corporate data on unsecured devices|Reduced hardware costs|Employee satisfaction|Faster network speeds",
  "What software is used to secure, monitor, and manage mobile devices in an organization?|MDM (Mobile Device Management)|CRM (Customer Relationship Management)|ERP (Enterprise Resource Planning)|DBMS (Database Management System)",
  "What is 'Jailbreaking' (iOS) or 'Rooting' (Android)?|Removing software restrictions imposed by the manufacturer|Installing a new screen|Updating the operating system|Adding more RAM",
  "Why is jailbreaking/rooting a security risk?|It bypasses built-in security protections and sandboxing|It makes the phone too fast|It breaks the camera|It increases battery life",
  "What is application sandboxing?|Isolating apps so they cannot access other apps' data|Testing apps in a desert|A game development term|A type of firewall",
  "What is 'Sideloading'?|Installing apps from unofficial sources outside the official app store|Charging the phone from the side|Downloading updates|Transferring files via Bluetooth",
  "Why is sideloading risky?|The apps are not vetted for malware by the official app store|It costs more money|It drains the battery|It deletes contacts",
  "Which communication technology allows contactless payments using smartphones?|NFC|Bluetooth|Wi-Fi|Infrared",
  "What is a 'Bluebugging' attack?|Gaining unauthorized access to a device via Bluetooth to control it|Sending unsolicited messages via Bluetooth|Stealing data over Wi-Fi|Jamming a network",
  "What is 'Bluejacking'?|Sending unsolicited messages to Bluetooth-enabled devices|Stealing data over Bluetooth|Taking control of a device|Crashing a network",
  "What type of network uses cell towers to provide coverage over a large area?|Cellular Network (WAN)|WLAN (Wi-Fi)|PAN (Bluetooth)|LAN",
  "What does GSM stand for?|Global System for Mobile Communications|General System for Mobile|Global Security for Mobile|General Security for Mobile",
  "What is the primary vulnerability in older 2G/GSM networks?|Lack of mutual authentication and weak encryption|It is too fast|It requires too much power|It has too much bandwidth",
  "What does a 'Stingray' or IMSI catcher do?|Acts as a fake cell tower to intercept mobile communications|Acts as a router|Boosts Wi-Fi signals|Encrypts data",
  "What does LTE stand for?|Long-Term Evolution|Local Transmission Engine|Light Transmission Equipment|Long-Term Encryption",
  "Which generation of mobile networks introduced mandatory encryption and better mutual authentication compared to 2G?|3G (UMTS)|1G|2G|Bluetooth",
  "What is the main improvement of 5G over 4G?|Higher speeds, lower latency, and massive device connectivity|Lower speeds|Worse battery life|Use of older protocols",
  "What is 'Network Slicing' in 5G?|Creating multiple virtual networks on top of a shared physical infrastructure|Cutting cables|Blocking specific users|Decreasing bandwidth",
  "What does IoT stand for?|Internet of Things|Internet of Technology|Integration of Things|Internet of Telecommunications",
  "What is a major security challenge with IoT devices?|They often have weak security, hardcoded passwords, and no updates|They are too expensive|They use too much RAM|They are too large",
  "What botnet famously used compromised IoT devices to launch massive DDoS attacks?|Mirai|Zeus|Stuxnet|WannaCry",
  "What is a 'Zero-Day' vulnerability?|A flaw unknown to the vendor with zero days to patch before exploitation|A completely secure system|A vulnerability that takes zero days to fix|A fake threat",
  "What does patching or updating software do?|Fixes known vulnerabilities and bugs|Adds viruses|Slows down the device|Deletes all data",
  "What does WIDS stand for?|Wireless Intrusion Detection System|Wired Intrusion Detection System|Wide Internet Defense System|Wireless Internet Data System",
  "What is the function of a WIDS?|To monitor wireless networks for unauthorized access and attacks|To route traffic|To assign IP addresses|To host websites",
  "What is a 'Rogue Access Point'?|An unauthorized access point connected to a secure network|A broken router|A firewall|A VPN server",
  "What is a MAC address spoofing attack?|Changing a device's MAC address to impersonate another device|Encrypting the MAC address|Deleting the MAC address|Translating an IP to a MAC",
  "What protocol is used to secure VoIP communications?|SRTP (Secure Real-time Transport Protocol)|HTTP|FTP|SMTP",
  "What does SIP stand for in VoIP?|Session Initiation Protocol|Secure Internet Protocol|System Integration Protocol|Standard Internet Protocol",
  "Which protocol is typically used for the actual transmission of voice data in VoIP?|RTP (Real-time Transport Protocol)|TCP|HTTP|POP3",
  "What does an attacker achieve with 'SIP Spoofing'?|Impersonating a legitimate VoIP caller|Encrypting the call|Improving call quality|Blocking the network",
  "Which of the following describes 'Phreaking'?|Hacking into telecommunications systems, including VoIP|A type of physical break-in|A web vulnerability|A database attack",
  "What does a 'VPN Gateway' do?|Terminates VPN tunnels and decrypts traffic for the internal network|Acts as a web server|Assigns IP addresses|Blocks all traffic",
  "What is an IPsec VPN used for?|Creating secure connections over an IP network|Designing web pages|Sending emails|Formatting hard drives",
  "What are the two main modes of IPsec?|Tunnel and Transport|Active and Passive|Client and Server|Secure and Open",
  "Which VPN protocol works primarily over a web browser using HTTPS?|SSL/TLS VPN|IPsec|PPTP|L2TP",
  "Why is public Wi-Fi generally considered insecure?|Traffic is often unencrypted and easily intercepted|It is too slow|It costs money|It requires a strict password",
  "What is the best way to secure data when using public Wi-Fi?|Use a VPN|Turn off the screen|Use an older browser|Hide the SSID",
  "Which cryptographic attack relies on the probability of two different inputs producing the same hash?|Birthday attack|Brute force|Dictionary attack|Replay attack",
  "What is the primary function of a Digital Signature?|To ensure non-repudiation and integrity|To encrypt the whole message|To compress data|To route packets",
  "Which protocol is commonly used to secure emails?|PGP (Pretty Good Privacy)|FTP|HTTP|DHCP",
  "What is the risk of using a weak initialization vector (IV) in WEP?|It allows attackers to easily recover the encryption key|It causes network lag|It deletes user data|It damages hardware",
  "What type of attack captures network traffic and sends it again later to trick a system?|Replay attack|Phishing|Ransomware|SQL Injection",
  "How do modern protocols prevent Replay attacks?|By using timestamps and sequence numbers|By ignoring all packets|By using longer passwords|By disabling Wi-Fi",
  "Which of the following is considered an Insider Threat?|A disgruntled employee stealing data|A remote hacker|A malware infection|A natural disaster",
  "What does 'Least Privilege' mean in security?|Giving users only the minimum access necessary to do their job|Giving everyone admin rights|Removing all passwords|Using the weakest encryption",
  "Which device connects different networks together and routes traffic between them?|Router|Switch|Hub|Access Point",
  "Which device connects devices within the same network?|Switch|Router|Modem|Firewall",
  "What is a VLAN?|Virtual Local Area Network|Visual Local Area Network|Verified Local Area Network|Virtual Large Area Network",
  "What is the security benefit of a VLAN?|It segments network traffic, isolating different groups of devices|It increases hardware speed|It encrypts all data|It prevents physical theft",
  "What is 'Port Scanning'?|Probing a server or host to find open ports and running services|A type of malware|Encrypting a hard drive|Connecting a USB cable",
  "What tool is commonly used for port scanning?|Nmap|Photoshop|Excel|Wireshark",
  "Which attack involves sending a massive amount of ping requests to a target?|Ping Flood (ICMP Flood)|Phishing|SQL Injection|Cross-Site Scripting",
  "What is the 'Ping of Death'?|Sending oversized, malformed ping packets to crash a system|A normal network test|A fast internet connection|A type of firewall",
  "What does XSS stand for?|Cross-Site Scripting|XML Simple Scripting|eXtreme Secure Server|Cross-System Security",
  "What does CSRF stand for?|Cross-Site Request Forgery|Cross-System Routing Firewalls|Central Secure Routing Function|Certified Security Response Force",
  "What type of attack targets a database by inserting malicious code into input fields?|SQL Injection|XSS|CSRF|Phishing",
  "Which authentication protocol uses tickets to grant access to resources?|Kerberos|NTLM|OATH|RADIUS",
  "What does RADIUS stand for?|Remote Authentication Dial-In User Service|Radio Access Data Internet User System|Remote Authorization Data Internet Usage System|Router Authorization Dial-In User Service",
  "What is the purpose of a DMZ (Demilitarized Zone) in a network?|To separate public-facing servers from the internal private network|To store backups|To speed up the network|To block all internet access",
  "What does DLP stand for?|Data Loss Prevention|Data Link Protocol|Download Priority|Data Logging Process",
  "What is the goal of DLP?|To prevent sensitive data from leaving the corporate network|To speed up downloads|To backup databases|To install software",
  "What is 'Geofencing' in mobile security?|Restricting a device's functionality based on its physical location|Building a wall|Encrypting a hard drive|Installing antivirus",
  "What is an 'Air Gap'?|A network that is physically isolated from the internet and other networks|A space between server racks|A type of wireless signal|A cloud storage system",
  "What does APT stand for in cybersecurity?|Advanced Persistent Threat|Automated Penetration Testing|Active Protocol Transmission|Anti-Phishing Tool",
  "Who typically carries out APT attacks?|Well-funded, highly skilled groups, often state-sponsored|Script kiddies|Amateur hackers|AI algorithms",
  "What is the primary motive of a typical APT?|Espionage and long-term data theft|Quick financial gain|Website defacement|Showing off",
  "What is 'Spear Phishing'?|A targeted phishing attack aimed at a specific individual or organization|A random, widespread phishing email|A physical attack|A type of malware",
  "What is 'Whaling'?|A spear phishing attack targeting high-level executives (CEOs, CFOs)|Fishing in the ocean|A database attack|A denial of service attack",
  "What is a 'Logic Bomb'?|Malicious code that executes when a specific condition or date is met|A physical explosive|A network error|A slow computer",
  "What is a 'Rootkit'?|Malware designed to hide the existence of certain processes or programs and maintain privileged access|A gardening tool|A type of VPN|A web browser",
  "How is a Rootkit typically detected?|By booting from a clean, trusted operating system to scan the drive|By using task manager|By restarting the computer|By changing the password",
  "What is 'Typosquatting'?|Registering domains similar to popular sites to trick users who make typos|Typing passwords incorrectly|A type of encryption|A firewall rule",
  "What does BCP stand for?|Business Continuity Plan|Basic Computer Protection|Backup Control Process|Business Communication Protocol",
  "What does DRP stand for?|Disaster Recovery Plan|Data Recovery Process|Digital Ransomware Protection|Database Routing Protocol",
  "What is the difference between BCP and DRP?|BCP focuses on keeping the business running, while DRP focuses on restoring IT systems after a disaster|They are exactly the same|DRP is for physical security, BCP is for cyber|BCP is for servers, DRP is for laptops",
  "What is a 'Cold Site' in disaster recovery?|An empty facility with power and cooling, but no hardware installed|A fully operational backup site|A site in a cold climate|A server room",
  "What is a 'Hot Site' in disaster recovery?|A fully equipped, operational site ready to take over immediately|An empty building|A site with partial hardware|A warm building",
  "What is 'Multi-Factor Authentication' (MFA)?|Requiring two or more different forms of authentication|Using a long password|Authenticating multiple users|Using a smart card only"
];

// Reformat questions array
const formattedQuestions = rawQuestions.map(q => {
  const parts = q.split('|');
  return {
    _id: new mongoose.Types.ObjectId(),
    text: parts[0],
    options: [
      { _id: new mongoose.Types.ObjectId(), text: parts[1], isCorrect: true },
      { _id: new mongoose.Types.ObjectId(), text: parts[2], isCorrect: false },
      { _id: new mongoose.Types.ObjectId(), text: parts[3], isCorrect: false },
      { _id: new mongoose.Types.ObjectId(), text: parts[4], isCorrect: false }
    ].sort(() => Math.random() - 0.5) // Shuffle options slightly
  };
});

// The notes corresponding to the 6 chapters
const courseNotes = [
  {
    chapterTitle: "Mobile & Wireless Security Concepts",
    content: "### Mobile & Wireless Security\n\nMobile security deals with the portability and wireless networking of devices. Mobile security involves protecting the hardware (phones, tablets, sensors), software (iOS, Android, banking apps), and the network (Wi-Fi, Bluetooth, NFC, 2G/3G/4G/5G). The core concepts of security include:\n\n- **Authentication**: Proving the identity of a user (passwords, biometrics).\n- **Authorization**: Granting access to resources based on identity.\n- **Confidentiality**: Ensuring data is kept private from unauthorized access.\n- **Integrity**: Ensuring data correctness and preventing tampering.\n- **Privacy**: Giving users control over their data."
  },
  {
    chapterTitle: "Network Models (OSI & TCP/IP)",
    content: "### The OSI and TCP/IP Models\n\nThe **OSI Model** (Open Systems Interconnection) is a 7-layer theoretical blueprint for understanding network communication:\n1. Application Layer\n2. Presentation Layer\n3. Session Layer\n4. Transport Layer\n5. Network Layer\n6. Data Link Layer\n7. Physical Layer\n\nThe **TCP/IP Model** is a 4-layer model upon which the Internet is built. It breaks data down into packets, sends them over the network, ensures they arrive, and reassembles them. The layers are Application, Transport, Internet, and Network Access."
  },
  {
    chapterTitle: "Wireless Network Technologies",
    content: "### Wireless Networks (WLAN)\n\nA Wireless Local Area Network (WLAN) connects devices using radio waves, governed by IEEE 802.11 standards. Key components include:\n\n- **Access Point (AP)**: Acts as a bridge between wireless stations and a wired network.\n- **Radio Frequency (RF)**: Data is transmitted via radio waves. Higher frequencies (like 5GHz) offer faster data rates but less range, while lower frequencies (like 2.4GHz) offer better range but slower speeds and more congestion.\n- **SSID**: The Service Set Identifier, used to identify a wireless network.\n- **Generations**: Mobile networks have evolved from 2G (weak security, no mutual authentication) to 3G, 4G, and 5G (stronger encryption, mutual authentication, higher speeds)."
  },
  {
    chapterTitle: "Wireless Network Threats",
    content: "### Network Threats\n\nWireless networks are vulnerable due to their open nature. Common threats include:\n\n- **Evil Twin**: Using a fake wireless access point to lure victims and steal data.\n- **Eavesdropping/Sniffing**: Intercepting data packets over the air.\n- **Man in the Middle (MitM)**: An attacker intercepts and alters communication between two parties.\n- **Piggybacking**: Unauthorized use of a private network for internet access or hacking.\n- **Denial of Service (DoS)**: Overwhelming a network or service to deny access to legitimate users.\n- **Wardriving**: Driving around searching for open or vulnerable Wi-Fi networks."
  },
  {
    chapterTitle: "Network Security Tools & Technology",
    content: "### Network Defense Tools\n\n- **Firewalls**: Security systems that monitor incoming and outgoing traffic based on rules. Can be hardware or software. Next-generation firewalls inspect actual content for malware.\n- **Network Access Control (NAC)**: Restricts availability of network resources to endpoint devices that comply with a defined security policy.\n- **Virtual Private Network (VPN)**: Creates secure, encrypted tunnels for remote workers to safely access corporate networks over public infrastructure.\n- **MDM (Mobile Device Management)**: Software enforcing security policies on mobile devices."
  },
  {
    chapterTitle: "RFID, VoIP, and Multimedia Streaming",
    content: "### Specialized Network Systems\n\n**RFID (Radio Frequency Identification)**\nUses tags and readers for tracking. Threats include unauthorized tracking, eavesdropping, tag cloning/spoofing, and DoS (jamming). Defenses include cryptographic authentication, kill commands, and blocker tags.\n\n**VoIP & Multimedia**\nVoIP transfers analog voice signals into digital packets over IP networks. Advantages include cost savings and rich media features. However, they face challenges like latency, packet loss, and jitter. Security protocols like SRTP and secure signaling are used to prevent interception and VoIP DoS attacks."
  }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const depts = ["Cyber Security", "Networking and Cloud Computing"];
  
  for (const deptName of depts) {
    console.log(`Processing for department: ${deptName}`);
    
    // Find department ObjectId
    const deptDoc = await db.collection('departments').findOne({ name: deptName });
    if (!deptDoc) {
      console.log(`Department ${deptName} not found! Skipping.`);
      continue;
    }
    const deptId = deptDoc._id;

    // Create course
    let course = await db.collection('courses').findOne({ title: `CYS 322 - MOBILE AND WIRELESS SECURITY - ${deptName.toUpperCase()}`, department: deptId });
    if (!course) {
      const result = await db.collection('courses').insertOne({
        title: `CYS 322 - MOBILE AND WIRELESS SECURITY - ${deptName.toUpperCase()}`,
        code: 'CYS 322',
        department: deptId,
        description: 'Comprehensive guide to mobile and wireless network security concepts, threats, and mitigation tools.',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      course = { _id: result.insertedId };
    }

    // Insert course notes
    for (let i = 0; i < courseNotes.length; i++) {
      const note = courseNotes[i];
      const existingNote = await db.collection('coursenotes').findOne({ course: course._id, chapterTitle: note.chapterTitle });
      if (!existingNote) {
        await db.collection('coursenotes').insertOne({
          course: course._id,
          chapterTitle: note.chapterTitle,
          content: note.content,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Insert Quiz
    const existingQuiz = await db.collection('quizzes').findOne({ course: course._id });
    if (!existingQuiz) {
      await db.collection('quizzes').insertOne({
        course: course._id,
        title: "CYS 322 Exam",
        timeLimit: 30, // 30 minutes
        questions: formattedQuestions,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Quiz inserted for ${deptName} with ${formattedQuestions.length} questions`);
    } else {
      await db.collection('quizzes').updateOne(
        { _id: existingQuiz._id },
        { $set: { questions: formattedQuestions, timeLimit: 30 } }
      );
      console.log(`Quiz updated for ${deptName} with ${formattedQuestions.length} questions`);
    }
  }

  console.log("CYS 322 completely seeded!");
  process.exit(0);
}

main().catch(console.error);
