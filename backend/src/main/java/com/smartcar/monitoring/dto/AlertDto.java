package com.smartcar.monitoring.dto;

import com.smartcar.monitoring.model.Alert;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class AlertDto {
    private Long id;

    @NotNull(message = "Car ID is required")
    private Long carId;

    private String carLicensePlate;

    @NotBlank(message = "Alert type is required")
    private String type;

    @NotNull(message = "Severity is required")
    private Alert.AlertSeverity severity;

    @NotNull(message = "Timestamp is required")
    private LocalDateTime timestamp;

    @NotNull(message = "Acknowledged is required")
    private Boolean acknowledged;

    private LocalDateTime creationDate;
    private LocalDateTime lastUpdateOn;
    private Boolean isActive;

    // Default constructor
    public AlertDto() {}

    // Constructor from Alert entity
    public AlertDto(Alert alert) {
        this.id = alert.getId();
        this.carId = alert.getCar() != null ? alert.getCar().getId() : null;
        this.type = alert.getType();
        this.severity = alert.getSeverity();
        this.timestamp = alert.getTimestamp();
        this.acknowledged = alert.getAcknowledged();
        this.creationDate = alert.getCreationDate();
        this.lastUpdateOn = alert.getLastUpdateOn();
        this.isActive = alert.getIsActive();
        // carLicensePlate is not set because Car does not have getLicensePlate()
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCarId() { return carId; }
    public void setCarId(Long carId) { this.carId = carId; }

    public String getCarLicensePlate() { return carLicensePlate; }
    public void setCarLicensePlate(String carLicensePlate) { this.carLicensePlate = carLicensePlate; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Alert.AlertSeverity getSeverity() { return severity; }
    public void setSeverity(Alert.AlertSeverity severity) { this.severity = severity; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Boolean getAcknowledged() { return acknowledged; }
    public void setAcknowledged(Boolean acknowledged) { this.acknowledged = acknowledged; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }

    public LocalDateTime getLastUpdateOn() { return lastUpdateOn; }
    public void setLastUpdateOn(LocalDateTime lastUpdateOn) { this.lastUpdateOn = lastUpdateOn; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
