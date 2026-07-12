package com.odoo.assetflow.repository;

import com.odoo.assetflow.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Greedy interval overlap check.
     * Counts active bookings for the given asset whose interval overlaps
     * the requested [requestedStartTime, requestedEndTime).
     * Two intervals [A,B) and [C,D) overlap if A < D AND B > C.
     */
    @Query("SELECT COUNT(b) FROM Booking b " +
           "WHERE b.asset.id = :assetId " +
           "AND b.status IN ('UPCOMING', 'ONGOING') " +
           "AND b.startTime < :requestedEndTime " +
           "AND b.endTime > :requestedStartTime")
    long countOverlappingBookings(
            @Param("assetId") Long assetId,
            @Param("requestedStartTime") LocalDateTime requestedStartTime,
            @Param("requestedEndTime") LocalDateTime requestedEndTime
    );

    List<Booking> findByAssetId(Long assetId);
    
    long countByStatus(com.odoo.assetflow.model.enums.BookingStatus status);
}
