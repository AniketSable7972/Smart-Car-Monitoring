package com.smartcar.monitoring.simulator;

import com.smartcar.monitoring.dto.TelemetryDto;
import com.smartcar.monitoring.model.Car;
import com.smartcar.monitoring.service.CarService;
import com.smartcar.monitoring.service.MqttService;
import com.smartcar.monitoring.service.WebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class TelemetrySimulator {

    private static final Logger logger = LoggerFactory.getLogger(TelemetrySimulator.class);

    @Autowired
    private MqttService mqttService;

    @Autowired
    private CarService carService;

    @Autowired
    private WebSocketService webSocketService;

    @Value("${simulator.enabled:true}")
    private boolean simulatorEnabled;

    @Value("${simulator.interval:5000}")
    private long simulatorInterval;

    @Value("${simulator.car.count:5}")
    private int carCount;

    private final Random random = new Random();
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    // Location coordinates for simulation (major cities)
    private final String[] locations = {
        "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
        "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA"
    };

    // Car statuses for simulation
    private final String[] carStatuses = {"IDLE", "MOVING", "PARKED", "MAINTENANCE"};

    @PostConstruct
    public void init() {
        if (simulatorEnabled) {
            logger.info("Telemetry Simulator initialized. Interval: {}ms, Car Count: {}", simulatorInterval, carCount);
            startSimulation();
        } else {
            logger.info("Telemetry Simulator is disabled");
        }
    }

    @Scheduled(fixedDelayString = "${simulator.interval:5000}")
    public void simulateTelemetry() {
        if (!simulatorEnabled || !isRunning.get()) {
            return;
        }

        try {
            List<Car> activeCars = carService.getAllActiveCars();
            
            if (activeCars.isEmpty()) {
                logger.warn("No active cars found for simulation");
                return;
            }

            // Simulate telemetry for each active car
            for (Car car : activeCars) {
                if (car.getIsActive()) {
                    TelemetryDto telemetryDto = generateTelemetryData(car);
                    mqttService.publishTelemetry(car.getId(), telemetryDto);
                    
                    // Update car status occasionally
                    if (random.nextInt(10) == 0) {
                        String newStatus = carStatuses[random.nextInt(carStatuses.length)];
                        mqttService.publishStatus(car.getId(), newStatus);
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Error in telemetry simulation", e);
        }
    }

    private TelemetryDto generateTelemetryData(Car car) {
        TelemetryDto telemetryDto = new TelemetryDto();
        
        // Generate realistic speed (0-140 km/h)
        int speed = generateSpeed();
        telemetryDto.setSpeed(speed);

        // Generate fuel level (0-100%)
        int fuelLevel = generateFuelLevel();
        telemetryDto.setFuelLevel(fuelLevel);

        // Generate temperature (-10 to 70°C)
        int temperature = generateTemperature();
        telemetryDto.setTemperature(temperature);

        // Generate location
        String location = generateLocation();
        telemetryDto.setLocation(location);

        // Set timestamp
        telemetryDto.setTimestamp(LocalDateTime.now());

        return telemetryDto;
    }

    private int generateSpeed() {
        // 70% chance of normal speed (0-80 km/h), 25% chance of highway speed (80-120 km/h), 5% chance of high speed (120-140 km/h)
        double chance = random.nextDouble();
        
        if (chance < 0.70) {
            return random.nextInt(81); // 0-80 km/h
        } else if (chance < 0.95) {
            return 80 + random.nextInt(41); // 80-120 km/h
        } else {
            return 120 + random.nextInt(21); // 120-140 km/h
        }
    }

    private int generateFuelLevel() {
        // 60% chance of normal fuel (20-100%), 30% chance of low fuel (10-30%), 10% chance of very low fuel (5-15%)
        double chance = random.nextDouble();
        
        if (chance < 0.60) {
            return 20 + random.nextInt(81); // 20-100%
        } else if (chance < 0.90) {
            return 10 + random.nextInt(21); // 10-30%
        } else {
            return 5 + random.nextInt(11); // 5-15%
        }
    }

    private int generateTemperature() {
        // 80% chance of normal temperature (10-40°C), 15% chance of extreme temperature (40-70°C), 5% chance of cold (-10 to 10°C)
        double chance = random.nextDouble();
        
        if (chance < 0.80) {
            return 10 + random.nextInt(31); // 10-40°C
        } else if (chance < 0.95) {
            return 40 + random.nextInt(31); // 40-70°C
        } else {
            return -10 + random.nextInt(21); // -10 to 10°C
        }
    }

    private String generateLocation() {
        return locations[random.nextInt(locations.length)];
    }

    public void startSimulation() {
        if (isRunning.compareAndSet(false, true)) {
            logger.info("Telemetry simulation started");
            webSocketService.broadcastSimulatorStatus(true);
        }
    }

    public void stopSimulation() {
        if (isRunning.compareAndSet(true, false)) {
            logger.info("Telemetry simulation stopped");
            webSocketService.broadcastSimulatorStatus(false);
        }
    }

    public boolean isRunning() {
        return isRunning.get();
    }

    public void setSimulatorEnabled(boolean enabled) {
        this.simulatorEnabled = enabled;
        if (enabled) {
            startSimulation();
        } else {
            stopSimulation();
        }
        logger.info("Telemetry simulator enabled: {}", enabled);
    }

    public void setSimulatorInterval(long interval) {
        this.simulatorInterval = interval;
        logger.info("Telemetry simulator interval updated: {}ms", interval);
    }
}
