import { pgTable, uuid, varchar, timestamp, boolean, integer, text, decimal, date, time, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─────────────────────────────
// ROLES & USERS
// ─────────────────────────────

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).unique().notNull(), // admin, technician
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  roleId: uuid('role_id').references(() => roles.id).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('invited'), // active, invited, disabled
  avatarUrl: varchar('avatar_url', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─────────────────────────────
// ZONES
// ─────────────────────────────

export const zones = pgTable('zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  zoneType: varchar('zone_type', { length: 20 }).notNull(), // proposed, additional
  module: varchar('module', { length: 20 }).notNull(), // trip, snow, both
  priority: varchar('priority', { length: 20 }).notNull(), // high, medium, low
  pointsGeojson: text('points_geojson').notNull(), // stores all polyline points as JSON array [{lat, lng, order}]
  totalPoints: integer('total_points').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const zoneTechnicians = pgTable('zone_technicians', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').references(() => zones.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
});

// ─────────────────────────────
// TRIP INSPECTION
// ─────────────────────────────

export const tripInspections = pgTable('trip_inspections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: varchar('trip_id', { length: 20 }).unique().notNull(), // T-001, T-002...
  zoneId: uuid('zone_id').references(() => zones.id).notNull(),
  inspectedBy: uuid('inspected_by').references(() => users.id), // filled when technician marks as inspected
  completedBy: uuid('completed_by').references(() => users.id), // filled when technician marks as completed
  streetName: varchar('street_name', { length: 100 }),
  avenueName: varchar('avenue_name', { length: 100 }),
  zoneType: varchar('zone_type', { length: 20 }).notNull(), // proposed, additional
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, inspected, completed
  capturedLatitude: decimal('captured_latitude', { precision: 10, scale: 7 }),
  capturedLongitude: decimal('captured_longitude', { precision: 10, scale: 7 }),
  highPoint: decimal('high_point', { precision: 10, scale: 2 }),
  lowPoint: decimal('low_point', { precision: 10, scale: 2 }),
  length: decimal('length', { precision: 10, scale: 2 }),
  notes: text('notes'),
  inspectedAt: timestamp('inspected_at'),
  completedAt: timestamp('completed_at'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─────────────────────────────
// SNOW REMOVAL
// ─────────────────────────────

export const snowRemovals = pgTable('snow_removals', {
  id: uuid('id').primaryKey().defaultRandom(),
  snowId: varchar('snow_id', { length: 20 }).unique().notNull(), // S-001, S-002...
  zoneId: uuid('zone_id').references(() => zones.id).notNull(),
  inspectedBy: uuid('inspected_by').references(() => users.id), // filled when technician marks as inspected
  completedBy: uuid('completed_by').references(() => users.id), // filled when technician marks as completed
  streetName: varchar('street_name', { length: 100 }),
  avenueName: varchar('avenue_name', { length: 100 }),
  zoneType: varchar('zone_type', { length: 20 }).notNull(), // proposed, additional
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, inspected, completed
  capturedLatitude: decimal('captured_latitude', { precision: 10, scale: 7 }),
  capturedLongitude: decimal('captured_longitude', { precision: 10, scale: 7 }),
  highPoint: decimal('high_point', { precision: 10, scale: 2 }),
  lowPoint: decimal('low_point', { precision: 10, scale: 2 }),
  length: decimal('length', { precision: 10, scale: 2 }),
  notes: text('notes'),
  inspectedAt: timestamp('inspected_at'),
  completedAt: timestamp('completed_at'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─────────────────────────────
// JOB PHOTOS
// ─────────────────────────────

export const jobPhotos = pgTable('job_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobType: varchar('job_type', { length: 20 }).notNull(), // 'trip' | 'snow'
  jobId: uuid('job_id').notNull(),                        // tripInspections.id or snowRemovals.id
  photoType: varchar('photo_type', { length: 20 }).notNull(), // 'before' | 'after'
  photoUrl: varchar('photo_url', { length: 255 }).notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─────────────────────────────
// ATTENDANCE & CHECK-IN
// ─────────────────────────────

export const checkinRequests = pgTable('checkin_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestId: varchar('request_id', { length: 20 }).unique().notNull(), // req-1, req-2...
  userId: uuid('user_id').references(() => users.id).notNull(),
  requestedAt: timestamp('requested_at').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, approved, rejected
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  checkInTime: time('check_in_time'),
  checkOutTime: time('check_out_time'),
  method: varchar('method', { length: 20 }).notNull(), // wifi, request
  locationName: varchar('location_name', { length: 100 }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  status: varchar('status', { length: 30 }).notNull().default('present'), // present, partial, missing_checkout
  checkInRequestId: uuid('check_in_request_id').references(() => checkinRequests.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wifiConfigs = pgTable('wifi_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  ssid: varchar('ssid', { length: 100 }).notNull(),
  locationName: varchar('location_name', { length: 100 }).notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─────────────────────────────
// TARGETS
// ─────────────────────────────

export const targets = pgTable('targets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  module: varchar('module', { length: 20 }).notNull(), // trip, snow
  period: varchar('period', { length: 20 }).notNull(), // yearly, monthly, weekly
  periodLabel: varchar('period_label', { length: 50 }).notNull(), // Dec 2025, Week 49
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 30 }).notNull(), // meters, tasks
  distribution: varchar('distribution', { length: 20 }).notNull(), // equal, custom
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, archived
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const targetUsers = pgTable('target_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  targetId: uuid('target_id').references(() => targets.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  allocatedValue: decimal('allocated_value', { precision: 10, scale: 2 }).notNull(),
});

// ─────────────────────────────
// REPORTS
// ─────────────────────────────

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: varchar('report_id', { length: 20 }).unique().notNull(), // RPT-001...
  title: varchar('title', { length: 150 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // trip, snow, attendance
  dateRangeStart: date('date_range_start'),
  dateRangeEnd: date('date_range_end'),
  relatedId: varchar('related_id', { length: 20 }), // T-003, S-001, ATT-W49
  status: varchar('status', { length: 20 }).notNull().default('generating'), // generating, ready, failed
  fileUrl: varchar('file_url', { length: 255 }),
  generatedBy: uuid('generated_by').references(() => users.id).notNull(),
  generatedAt: timestamp('generated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─────────────────────────────
// SYSTEM
// ─────────────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  module: varchar('module', { length: 30 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const companySettings = pgTable('company_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyName: varchar('company_name', { length: 100 }),
  city: varchar('city', { length: 100 }),
  province: varchar('province', { length: 50 }),
  country: varchar('country', { length: 50 }),
  officeAddress: text('office_address'),
  officeLatitude: decimal('office_latitude', { precision: 10, scale: 7 }),
  officeLongitude: decimal('office_longitude', { precision: 10, scale: 7 }),
  logoUrl: varchar('logo_url', { length: 255 }),
  supportEmail: varchar('support_email', { length: 100 }),
  supportPhone: varchar('support_phone', { length: 30 }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─────────────────────────────
// RELATIONS
// ─────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));

export const zonesRelations = relations(zones, ({ one }) => ({
  createdBy: one(users, {
    fields: [zones.createdBy],
    references: [users.id],
  }),
}));

export const tripInspectionsRelations = relations(tripInspections, ({ one }) => ({
  zone: one(zones, {
    fields: [tripInspections.zoneId],
    references: [zones.id],
  }),
  inspectedByUser: one(users, {
    fields: [tripInspections.inspectedBy],
    references: [users.id],
  }),
  completedByUser: one(users, {
    fields: [tripInspections.completedBy],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [tripInspections.createdBy],
    references: [users.id],
  }),
}));

export const snowRemovalsRelations = relations(snowRemovals, ({ one }) => ({
  zone: one(zones, {
    fields: [snowRemovals.zoneId],
    references: [zones.id],
  }),
  inspectedByUser: one(users, {
    fields: [snowRemovals.inspectedBy],
    references: [users.id],
  }),
  completedByUser: one(users, {
    fields: [snowRemovals.completedBy],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [snowRemovals.createdBy],
    references: [users.id],
  }),
}));

export const jobPhotosRelations = relations(jobPhotos, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [jobPhotos.uploadedBy],
    references: [users.id],
  }),
}));

export const checkinRequestsRelations = relations(checkinRequests, ({ one }) => ({
  user: one(users, {
    fields: [checkinRequests.userId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [checkinRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, {
    fields: [attendance.userId],
    references: [users.id],
  }),
  checkInRequest: one(checkinRequests, {
    fields: [attendance.checkInRequestId],
    references: [checkinRequests.id],
  }),
}));

export const targetsRelations = relations(targets, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [targets.createdBy],
    references: [users.id],
  }),
  targetUsers: many(targetUsers),
}));

export const targetUsersRelations = relations(targetUsers, ({ one }) => ({
  target: one(targets, {
    fields: [targetUsers.targetId],
    references: [targets.id],
  }),
  user: one(users, {
    fields: [targetUsers.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  generatedByUser: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
