@echo off
echo Starting Smart Warehouse Inventory Optimizer Backend...
set JAVA_HOME=C:\Program Files\JetBrains\PyCharm 2026.2.2\jbr
set PATH=C:\Users\Rajashekher\.maven\apache-maven-3.9.9\bin;%JAVA_HOME%\bin;%PATH%
cd backend
mvn spring-boot:run
pause
