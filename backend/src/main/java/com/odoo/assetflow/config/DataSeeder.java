package com.odoo.assetflow.config;

import com.odoo.assetflow.model.User;
import com.odoo.assetflow.model.Department;
import com.odoo.assetflow.model.AssetCategory;
import com.odoo.assetflow.model.enums.Role;
import com.odoo.assetflow.repository.UserRepository;
import com.odoo.assetflow.repository.DepartmentRepository;
import com.odoo.assetflow.repository.AssetCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.odoo.assetflow.repository.AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetCategoryRepository categoryRepository;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder, com.odoo.assetflow.repository.AssetRepository assetRepository, DepartmentRepository departmentRepository, AssetCategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.assetRepository = assetRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            System.out.println("No departments found. Seeding demo departments...");
            Department it = new Department("IT & Infrastructure");
            Department hr = new Department("Human Resources");
            Department ops = new Department("Operations");
            departmentRepository.saveAll(List.of(it, hr, ops));
        }

        if (categoryRepository.count() == 0) {
            System.out.println("No categories found. Seeding demo categories...");
            AssetCategory cat1 = new AssetCategory("Electronics", "Laptops, Desktops, Tablets");
            cat1.setCustomFields("{\"warrantyPeriod\": \"string\", \"os\": \"string\"}");
            AssetCategory cat2 = new AssetCategory("Furniture", "Desks, Chairs, Cabinets");
            AssetCategory cat3 = new AssetCategory("Facilities", "Rooms, Lab space");
            AssetCategory cat4 = new AssetCategory("AV Equip", "Projectors, Screens, Mics");
            categoryRepository.saveAll(List.of(cat1, cat2, cat3, cat4));
        }

        if (userRepository.findByEmail("admin@assetflow.com").isEmpty()) {
            System.out.println("No admin user found. Seeding demo users...");

            User admin = new User("System Admin", "admin@assetflow.com", passwordEncoder.encode("admin123"), Role.ADMIN);
            User manager = new User("Asset Manager", "manager@assetflow.com", passwordEncoder.encode("manager123"), Role.ASSET_MANAGER);
            User head = new User("Department Head", "head@assetflow.com", passwordEncoder.encode("head123"), Role.DEPARTMENT_HEAD);
            User employee = new User("Regular Employee", "employee@assetflow.com", passwordEncoder.encode("employee123"), Role.EMPLOYEE);

            userRepository.saveAll(List.of(admin, manager, head, employee));
            
            System.out.println("Seeded 4 demo users (admin, manager, head, employee).");
        }

        if (assetRepository.findAll().stream().noneMatch(a -> "ROOM-A".equals(a.getAssetTag()))) {
            System.out.println("Demo assets not found. Seeding demo assets...");
            com.odoo.assetflow.model.Asset asset1 = new com.odoo.assetflow.model.Asset("Conference Room A", "ROOM-A", true, com.odoo.assetflow.model.enums.AssetStatus.AVAILABLE);
            asset1.setCategory("Facilities");
            
            com.odoo.assetflow.model.Asset asset2 = new com.odoo.assetflow.model.Asset("Projector 4K", "PROJ-4K-01", true, com.odoo.assetflow.model.enums.AssetStatus.AVAILABLE);
            asset2.setCategory("Electronics");
            
            com.odoo.assetflow.model.Asset asset3 = new com.odoo.assetflow.model.Asset("Dell XPS 15", "LT-DELL-100", false, com.odoo.assetflow.model.enums.AssetStatus.ALLOCATED);
            asset3.setCategory("Electronics");
            User emp = userRepository.findByEmail("employee@assetflow.com").orElse(null);
            if (emp != null) {
                asset3.setAssignedUserId(emp.getId());
            }
            
            com.odoo.assetflow.model.Asset asset4 = new com.odoo.assetflow.model.Asset("Standing Desk", "FURN-SD-05", false, com.odoo.assetflow.model.enums.AssetStatus.AVAILABLE);
            asset4.setCategory("Furniture");

            assetRepository.saveAll(List.of(asset1, asset2, asset3, asset4));
            System.out.println("Seeded 4 demo assets (1 allocated to employee, 2 shared bookable).");
        }
    }
}
