package com.odoo.assetflow.model;

import com.odoo.assetflow.model.enums.BookingStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.UPCOMING;

    public Booking() {}

    public Long getId()                      { return id; }
    public Asset getAsset()                  { return asset; }
    public void setAsset(Asset a)            { this.asset = a; }
    public User getUser()                    { return user; }
    public void setUser(User u)              { this.user = u; }
    public LocalDateTime getStartTime()      { return startTime; }
    public void setStartTime(LocalDateTime t){ this.startTime = t; }
    public LocalDateTime getEndTime()        { return endTime; }
    public void setEndTime(LocalDateTime t)  { this.endTime = t; }
    public BookingStatus getStatus()         { return status; }
    public void setStatus(BookingStatus s)   { this.status = s; }
}
