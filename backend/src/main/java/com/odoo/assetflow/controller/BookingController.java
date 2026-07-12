package com.odoo.assetflow.controller;

import com.odoo.assetflow.dto.BookingDTO;
import com.odoo.assetflow.dto.BookingRequestDTO;
import com.odoo.assetflow.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** GET /api/v1/bookings?assetId=X  (optional filter) */
    @GetMapping
    public ResponseEntity<List<BookingDTO>> getBookings(
            @RequestParam(required = false) Long assetId) {
        if (assetId != null) {
            return ResponseEntity.ok(bookingService.getBookingsForAsset(assetId));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /** POST /api/v1/bookings */
    @PostMapping
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody BookingRequestDTO request) {
        try {
            BookingDTO booking = bookingService.createBooking(
                    request.assetId(),
                    request.userId(),
                    request.startTime(),
                    request.endTime()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /** PATCH /api/v1/bookings/{id}/cancel */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
