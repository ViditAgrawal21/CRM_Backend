-- ========================================
-- CRM Database Seed Data
-- Execute this AFTER running database-setup.sql
-- ========================================

-- Password for all users: test123
-- Bcrypt hash: $2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe

-- ========================================
-- 1. Users (Hierarchy)
-- ========================================

-- Owner (Top level - no parent)
-- Password: owner123
-- Bcrypt hash: $2b$10$xQkVZYGGTz0p5qJZr5L5xuI5g5yJ5gPZ5h5F5n5L5L5L5L5L5L5L5L
INSERT INTO users (id, name, phone, password_hash, role, parent_id)
VALUES 
('00000000-0000-0000-0000-000000000000', 'Owner', '9999999999', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'owner', NULL);

-- Admin (created by Owner)
INSERT INTO users (id, name, phone, password_hash, role, parent_id, monthly_meeting_target, monthly_visit_target, monthly_revenue_target, monthly_bonus)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', '8888888888', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'admin', 
'00000000-0000-0000-0000-000000000000', 50, 30, 5000000, 50000);

-- Managers (created by Admin)
INSERT INTO users (id, name, phone, password_hash, role, parent_id, monthly_meeting_target, monthly_visit_target, monthly_revenue_target, monthly_bonus)
VALUES 
('22222222-2222-2222-2222-222222222222', 'Priya Sharma', '7777777777', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'manager', 
'11111111-1111-1111-1111-111111111111', 40, 25, 3000000, 30000),
('22222222-2222-2222-2222-222222222223', 'Amit Patel', '7777777776', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'manager', 
'11111111-1111-1111-1111-111111111111', 40, 25, 3000000, 30000);

-- Employees under Manager 1 (Priya)
INSERT INTO users (id, name, phone, password_hash, role, parent_id, monthly_meeting_target, monthly_visit_target, monthly_revenue_target, monthly_bonus)
VALUES 
('33333333-3333-3333-3333-333333333333', 'Rahul Desai', '6666666666', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'employee', 
'22222222-2222-2222-2222-222222222222', 25, 15, 1500000, 15000),
('33333333-3333-3333-3333-333333333334', 'Sneha Reddy', '6666666665', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'employee', 
'22222222-2222-2222-2222-222222222222', 25, 15, 1500000, 15000),
('33333333-3333-3333-3333-333333333335', 'Vikram Singh', '6666666664', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'employee', 
'22222222-2222-2222-2222-222222222222', 25, 15, 1500000, 15000);

-- Employees under Manager 2 (Amit)
INSERT INTO users (id, name, phone, password_hash, role, parent_id, monthly_meeting_target, monthly_visit_target, monthly_revenue_target, monthly_bonus)
VALUES 
('33333333-3333-3333-3333-333333333336', 'Neha Gupta', '6666666663', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'employee', 
'22222222-2222-2222-2222-222222222223', 25, 15, 1500000, 15000),
('33333333-3333-3333-3333-333333333337', 'Karan Malhotra', '6666666662', '$2b$10$MzUt5/cWKzR9i/uSXeQ2.Ou9Y02XfQtmmbe3QT.j3lI1i3DsHEMXe', 'employee', 
'22222222-2222-2222-2222-222222222223', 25, 15, 1500000, 15000);

-- ========================================
-- 2. Templates
-- ========================================

INSERT INTO templates (id, title, message, created_by)
VALUES 
('44444444-4444-4444-4444-444444444441', 'Welcome Message', 'Hello! Thank you for your interest in our premium real estate projects. We have exciting 2BHK and 3BHK apartments in Pune. Would you like to schedule a site visit?', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444442', 'Follow-up Message', 'Hi! This is a follow-up regarding our previous conversation about the property. Are you still interested in exploring the project? We have special offers this month!', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444443', 'Site Visit Reminder', 'Reminder: Your site visit is scheduled for tomorrow at our Green Valley project. Our team will be waiting for you. Please confirm your availability.', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'Price Details', 'Thank you for your inquiry. Our 2BHK apartments start from ₹65L and 3BHK from ₹95L. We offer flexible payment plans and bank loan assistance. Would you like detailed brochure?', '11111111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444445', 'Festive Offer', 'Special Festive Offer! Get up to ₹2L discount on bookings this month. Limited period offer. Book your dream home now! Call us for more details.', '11111111-1111-1111-1111-111111111111');

-- ========================================
-- 3. Leads
-- ========================================

INSERT INTO leads (id, type, date, name, phone, configuration, location, status, remark, assigned_to, created_by)
VALUES 
-- Rahul's leads
('55555555-5555-5555-5555-555555555551', 'lead', '2026-01-28', 'Amit Shah', '9876543210', '2BHK', 'Pune West', 'prospect', 'Very interested, budget confirmed', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555552', 'lead', '2026-01-29', 'Sunita Joshi', '9876543211', '3BHK', 'Pune West', 'contacted', 'Called, requested callback tomorrow', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555553', 'lead', '2026-02-01', 'Rohan Mehta', '9876543212', '2BHK', 'Pune East', 'new', 'Interested in Green Valley project', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555554', 'lead', '2026-02-02', 'Kavita Rao', '9876543213', '3BHK', 'Pune West', 'interested', 'Budget: 1Cr, wants higher floor', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),

-- Sneha's leads
('55555555-5555-5555-5555-555555555555', 'lead', '2026-01-30', 'Rajesh Kulkarni', '9876543214', '2BHK', 'Pune South', 'contacted', 'Interested in payment plans', '33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555556', 'lead', '2026-02-01', 'Pooja Nair', '9876543215', '3BHK', 'Pune West', 'prospect', 'Site visit completed, very positive', '33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555557', 'data', '2026-02-02', 'Sanjay Kumar', '9876543216', '2BHK', 'Pune East', 'spam', 'Wrong number, broker', '33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111'),

-- Vikram's leads
('55555555-5555-5555-5555-555555555558', 'lead', '2026-01-31', 'Deepa Iyer', '9876543217', '3BHK', 'Pune West', 'interested', 'Family of 5, needs spacious flat', '33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555559', 'lead', '2026-02-01', 'Manish Agarwal', '9876543218', '2BHK', 'Pune North', 'contacted', 'Will decide after Diwali', '33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555560', 'lead', '2026-02-03', 'Anita Deshmukh', '9876543219', '3BHK', 'Pune West', 'new', 'Just received, need to call', '33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111111'),

-- Neha's leads
('55555555-5555-5555-5555-555555555561', 'lead', '2026-02-01', 'Suresh Patil', '9876543220', '2BHK', 'Pune East', 'contacted', 'Looking for investment property', '33333333-3333-3333-3333-333333333336', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555562', 'lead', '2026-02-02', 'Meera Chopra', '9876543221', '3BHK', 'Pune West', 'prospect', 'Ready to book, comparing prices', '33333333-3333-3333-3333-333333333336', '11111111-1111-1111-1111-111111111111'),

-- Karan's leads
('55555555-5555-5555-5555-555555555563', 'lead', '2026-02-02', 'Vishal Yadav', '9876543222', '2BHK', 'Pune South', 'new', 'First time buyer, needs guidance', '33333333-3333-3333-3333-333333333337', '11111111-1111-1111-1111-111111111111'),
('55555555-5555-5555-5555-555555555564', 'lead', '2026-02-03', 'Priyanka Jain', '9876543223', '3BHK', 'Pune West', 'contacted', 'Wants to see sample flat', '33333333-3333-3333-3333-333333333337', '11111111-1111-1111-1111-111111111111');

-- ========================================
-- 4. Follow-ups
-- ========================================

INSERT INTO followups (id, lead_id, user_id, reminder_at, status, outcome, notes)
VALUES 
('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333333', '2026-02-04 10:00:00+00', 'pending', NULL, 'Call back as requested by customer'),
('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', '2026-02-04 14:00:00+00', 'pending', NULL, 'Discuss floor options and pricing'),
('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333334', '2026-02-04 11:00:00+00', 'pending', NULL, 'Share payment plan details'),
('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555559', '33333333-3333-3333-3333-333333333335', '2026-02-05 10:00:00+00', 'pending', NULL, 'Follow up after Diwali decision'),
('66666666-6666-6666-6666-666666666665', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', '2026-02-01 10:00:00+00', 'done', 'interested', 'Confirmed site visit, very positive'),
('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555563', '33333333-3333-3333-3333-333333333337', '2026-02-04 15:00:00+00', 'pending', NULL, 'Schedule meeting to explain process');

-- ========================================
-- 5. Meetings
-- ========================================

INSERT INTO meetings (id, lead_id, user_id, scheduled_at, location, status, outcome, notes)
VALUES 
('77777777-7777-7777-7777-777777777771', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', '2026-01-30 14:00:00+00', 'Green Valley Office, Pune West', 'completed', 'Very positive meeting. Customer ready to proceed.', 'Discussed payment plan, showed brochure, customer liked 2BHK on 7th floor'),
('77777777-7777-7777-7777-777777777772', '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', '2026-02-05 11:00:00+00', 'Sales Office, Pune', 'scheduled', NULL, 'Meeting to discuss 3BHK pricing and floor plans'),
('77777777-7777-7777-7777-777777777773', '55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333334', '2026-02-01 15:00:00+00', 'Green Valley Project Site', 'completed', 'Customer loved the project, comparing with one more option', 'Showed model flat, customer impressed with amenities'),
('77777777-7777-7777-7777-777777777774', '55555555-5555-5555-5555-555555555562', '33333333-3333-3333-3333-333333333336', '2026-02-04 16:00:00+00', 'Sales Office, Pune', 'scheduled', NULL, 'Final discussion before booking');

-- ========================================
-- 6. Site Visits
-- ========================================

INSERT INTO visits (id, lead_id, user_id, scheduled_at, site_location, status, outcome, notes)
VALUES 
('88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', '2026-02-05 10:00:00+00', 'Green Valley Project, Pune West - Phase 2', 'scheduled', NULL, 'Show 2BHK model flat on 7th floor'),
('88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333334', '2026-01-31 11:00:00+00', 'Green Valley Project, Pune West - Phase 1', 'completed', 'Customer very impressed with project quality and location', 'Showed 3BHK model flat, amenities, clubhouse'),
('88888888-8888-8888-8888-888888888883', '55555555-5555-5555-5555-555555555558', '33333333-3333-3333-3333-333333333335', '2026-02-06 14:00:00+00', 'Green Valley Project, Pune West - Phase 2', 'scheduled', NULL, 'Show spacious 3BHK for family of 5'),
('88888888-8888-8888-8888-888888888884', '55555555-5555-5555-5555-555555555564', '33333333-3333-3333-3333-333333333337', '2026-02-04 10:00:00+00', 'Green Valley Project, Pune West - Phase 1', 'scheduled', NULL, 'Show sample 3BHK flat');

-- ========================================
-- 7. Activity Logs
-- ========================================

INSERT INTO logs (id, lead_id, user_id, action, template_id, duration, outcome, notes)
VALUES 
('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 'call', NULL, 240, 'interested', 'Long conversation about pricing and location'),
('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333333', 'call', NULL, 180, 'call_back', 'Customer busy, requested callback tomorrow'),
('99999999-9999-9999-9999-999999999993', '55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333333', 'whatsapp', NULL, NULL, 'interested', 'Sent project brochure'),
('99999999-9999-9999-9999-999999999994', '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', 'template', '44444444-4444-4444-4444-444444444441', NULL, 'interested', 'Sent welcome message via WhatsApp'),
('99999999-9999-9999-9999-999999999995', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333334', 'call', NULL, 300, 'interested', 'Detailed discussion about payment plans'),
('99999999-9999-9999-9999-999999999996', '55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333334', 'call', NULL, 150, 'interested', 'Post site visit follow up'),
('99999999-9999-9999-9999-999999999997', '55555555-5555-5555-5555-555555555557', '33333333-3333-3333-3333-333333333334', 'call', NULL, 60, 'wrong_number', 'Wrong number, marked as spam'),
('99999999-9999-9999-9999-999999999998', '55555555-5555-5555-5555-555555555558', '33333333-3333-3333-3333-333333333335', 'call', NULL, 210, 'interested', 'Family needs spacious flat, discussed 3BHK options'),
('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555561', '33333333-3333-3333-3333-333333333336', 'whatsapp', NULL, NULL, 'interested', 'Sent investment ROI details'),
('99999999-9999-9999-9999-999999999910', '55555555-5555-5555-5555-555555555562', '33333333-3333-3333-3333-333333333336', 'call', NULL, 270, 'interested', 'Comparing prices, very close to booking');

-- ========================================
-- 8. Notes
-- ========================================

INSERT INTO notes (id, lead_id, user_id, text)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 'Customer prefers 7th floor or higher. Budget: 70-75L. Family size: 4 members. Needs possession by Dec 2026.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', 'Interested in corner flat with cross ventilation. Budget flexible up to 1.2Cr. First home buyer.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333334', 'Loved the project amenities - swimming pool, gym, kids play area. Comparing with one competitor near Hinjewadi.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad', '55555555-5555-5555-5555-555555555558', '33333333-3333-3333-3333-333333333335', 'Family of 5 (parents + 3 kids). Needs 3BHK minimum. Good school nearby is important. Budget 95L-1Cr.'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae', '55555555-5555-5555-5555-555555555562', '33333333-3333-3333-3333-333333333336', 'Working couple, no kids. Investment purpose. Prefers ready-to-move-in or near-completion projects. Budget 80-90L.');

-- ========================================
-- 9. Targets (February 2026)
-- ========================================

INSERT INTO targets (id, user_id, month, meeting_target, visit_target, revenue_target, bonus, meeting_achieved, visit_achieved, revenue_achieved, bonus_approved)
VALUES 
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '2026-02-01', 50, 30, 5000000, 50000, 4, 3, 0, false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '33333333-3333-3333-3333-333333333333', '2026-02-01', 25, 15, 1500000, 15000, 2, 1, 0, false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', '33333333-3333-3333-3333-333333333334', '2026-02-01', 25, 15, 1500000, 15000, 2, 1, 0, false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe', '33333333-3333-3333-3333-333333333335', '2026-02-01', 25, 15, 1500000, 15000, 0, 1, 0, false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbff', '33333333-3333-3333-3333-333333333336', '2026-02-01', 25, 15, 1500000, 15000, 1, 0, 0, false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbc0', '33333333-3333-3333-3333-333333333337', '2026-02-01', 25, 15, 1500000, 15000, 0, 1, 0, false);

-- ========================================
-- 10. Daily Reports
-- ========================================

INSERT INTO daily_reports (id, user_id, report_date, visits_till_now, meetings_till_now, today_meetings, today_visits, total_calls, next_day_plan)
VALUES 
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '2026-02-01', 1, 2, 0, 0, 5, 'Follow up with Sunita Joshi. Schedule site visit for Amit Shah. Call 3 new leads.'),
('cccccccc-cccc-cccc-cccc-cccccccccccd', '33333333-3333-3333-3333-333333333333', '2026-02-02', 1, 3, 1, 0, 4, 'Complete Kavita Rao meeting. Follow up with Rohan Mehta. Update lead statuses.'),
('cccccccc-cccc-cccc-cccc-ccccccccccce', '33333333-3333-3333-3333-333333333334', '2026-02-01', 1, 2, 1, 1, 6, 'Follow up with Pooja after site visit. Call Rajesh for payment plan. Update CRM.'),
('cccccccc-cccc-cccc-cccc-cccccccccccf', '33333333-3333-3333-3333-333333333335', '2026-02-02', 1, 0, 0, 0, 3, 'Schedule site visit for Deepa Iyer. Follow up with Manish Agarwal. Call new lead Anita.');

-- ========================================
-- Success Message
-- ========================================

SELECT 'Seed data inserted successfully!' AS message,
       'Users: 8 (1 Owner, 1 Admin, 2 Managers, 5 Employees)' AS users,
       'Leads: 14 leads across all employees' AS leads,
       'Templates: 5 message templates' AS templates,
       'Meetings: 4 scheduled/completed' AS meetings,
       'Visits: 4 scheduled/completed' AS visits,
       'Logs: 10 activity logs' AS logs,
       'Notes: 5 notes on leads' AS notes,
       'Follow-ups: 6 follow-ups' AS followups,
       'Targets: 6 monthly targets' AS targets,
       'Daily Reports: 4 daily reports' AS reports;
