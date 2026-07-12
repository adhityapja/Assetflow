package com.odoo.assetflow.service;

import com.odoo.assetflow.model.Asset;
import com.odoo.assetflow.model.Booking;
import com.odoo.assetflow.model.User;
import com.odoo.assetflow.model.enums.BookingStatus;
import com.odoo.assetflow.repository.AssetRepository;
import com.odoo.assetflow.repository.BookingRepository;
import com.odoo.assetflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.odoo.assetflow.dto.BookingDTO;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AssetRepository   assetRepository;
    private final UserRepository    userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          AssetRepository assetRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.assetRepository   = assetRepository;
        this.userRepository    = userRepository;
        this.notificationService = notificationService;
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsForAsset(Long assetId) {
        return bookingRepository.findByAssetId(assetId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BookingDTO mapToDTO(Booking b) {
        return new BookingDTO(
                b.getId(),
                b.getAsset().getId(),
                b.getAsset().getName(),
                b.getUser().getId(),
                b.getUser().getName(),
                b.getStartTime(),
                b.getEndTime(),
                b.getStatus().name()
        );
    }

    @Transactional
    public BookingDTO createBooking(Long assetId, Long userId,
                                 LocalDateTime start, LocalDateTime end) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("Asset not found: " + assetId));

        if (!asset.isSharedBookable()) {
            throw new RuntimeException(
                "This asset is not marked as a shared bookable resource.");
        }

        // Greedy interval overlap check (JPQL)
        long conflicts = bookingRepository.countOverlappingBookings(assetId, start, end);
        if (conflicts > 0) {
            throw new RuntimeException(
                "Booking overlap detected: The requested time slot conflicts with an existing booking.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Booking booking = new Booking();
        booking.setAsset(asset);
        booking.setUser(user);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus(BookingStatus.UPCOMING);
        
        booking = bookingRepository.save(booking);
        
        notificationService.createNotification(userId, "Your booking for " + asset.getName() + " has been confirmed for " + start.toString(), "INFO");

        return mapToDTO(booking);
    }

    @Transactional
    public BookingDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        
        notificationService.createNotification(booking.getUser().getId(), "Your booking for " + booking.getAsset().getName() + " has been cancelled.", "WARNING");
        
        return mapToDTO(booking);
    }
}
