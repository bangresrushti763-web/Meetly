@echo off
echo Changing DNS to Google DNS (8.8.8.8)...
echo This will require administrator privileges.

netsh interface ipv4 set dns "Ethernet" static 8.8.8.8 primary
netsh interface ipv4 set dns "Ethernet" static 8.8.4.4 secondary

netsh interface ipv4 set dns "Wi-Fi" static 8.8.8.8 primary
netsh interface ipv4 set dns "Wi-Fi" static 8.8.4.4 secondary

echo DNS changed to Google DNS.
echo Flushing DNS cache...
ipconfig /flushdns

echo Testing DNS resolution...
nslookup cluster0.nyg7tdk.mongodb.net

echo.
echo If the above test was successful, try running your application again.
pause