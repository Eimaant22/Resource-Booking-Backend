# Module 2: User Management

---

# Controller: getProfile

## Purpose

Retrieves the profile of the currently logged-in user.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| GET | `/api/users/profile` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ✅ Member
- ✅ Guest (if authenticated)

## Example Request

### Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | Profile retrieved successfully |
| 401 | Authentication required |
| 404 | User not found |
| 500 | Internal server error |

## Frontend Usage (PRD)

Used on the **Profile** and **Account Settings** page to display the logged-in user's information after login.

## Models Used

- User

---

# Controller: updateProfile

## Purpose

Allows the logged-in user to update their personal information such as name, phone number, department, and profile photo.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| PATCH | `/api/users/profile` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ✅ Member
- ✅ Guest (if authenticated)

## Example Request

```json
{
  "name": "John Doe",
  "phone": "+923001234567",
  "department": "Computer Science",
  "photoUrl": "https://example.com/profile.jpg"
}
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | Profile updated successfully |
| 401 | Authentication required |
| 404 | User not found |
| 500 | Internal server error |

## Frontend Usage (PRD)

Used on the **Edit Profile** page when a user updates their personal information.

## Models Used

- User

## Notes

- ✅ Good implementation.
- Consider adding request validation for phone number and URL format.

---

# Controller: getUsers

## Purpose

Retrieves the list of users. Super Admin can view all users, while Space Admin can only view users belonging to their organization.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| GET | `/api/users` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (`super_admin`, `space_admin`) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Example Request

```http
GET /api/users?search=john&role=member&isActive=true
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | Users retrieved successfully |
| 401 | Authentication required |
| 403 | Access denied |
| 404 | Logged-in user not found |
| 500 | Internal server error |

## Frontend Usage (PRD)

Used in the **User Management** page where administrators can search, filter, and manage organization members.

## Models Used

- User

## Notes

- ✅ Nice filtering implementation with search, role, organization, and active status.

---

# Controller: getUserById

## Purpose

Retrieves the details of a specific user by ID.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| GET | `/api/users/:id` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (`super_admin`, `space_admin`) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Example Request

```http
GET /api/users/6875e1d8f0c7d3a8d9f12345
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | User retrieved successfully |
| 400 | Invalid user ID |
| 401 | Authentication required |
| 403 | Access denied |
| 404 | User not found |
| 500 | Internal server error |

## Frontend Usage (PRD)

Used when an administrator opens a user's profile from the **User Management** page to view detailed information.

## Models Used

- User

## Notes

- ✅ Organization ownership check for Space Admin is a good security practice.

---

# Controller: updateUserRole

## Purpose

Allows the Super Admin to change the role of a user within the organization.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| PATCH | `/api/users/:id/role` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (`super_admin`) |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Example Request

```json
{
  "role": "space_admin"
}
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | User role updated successfully |
| 400 | Invalid ID or self-role change not allowed |
| 401 | Authentication required |
| 403 | Cannot modify Super Admin |
| 404 | User not found |
| 422 | Invalid or missing role |
| 500 | Internal server error |

## Frontend Usage (PRD)

Used in the **Admin User Management** page where the Super Admin assigns or updates user roles. This supports the PRD's Role-Based Access Control, allowing administrators to define which users can manage resources or bookings.

## Models Used

- User

## Notes
- Prevents changing the Super Admin's role.
- Prevents users from changing their own role.
- Restricts allowed roles correctly.

---

# Controller: updateUserStatus

## Purpose

Updates the active status (`isActive`) of a user account. This allows administrators to activate or deactivate user accounts without permanently deleting them.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| PATCH | `/api/users/:id/status` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (`super_admin`, `space_admin`) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Example Request

```http
PATCH /api/users/6875e1d8f0c7d3a8d9f12345/status
Authorization: Bearer <JWT_TOKEN>
```

```json
{
  "isActive": false
}
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | User status updated successfully. |
| 400 | Invalid user ID or attempting to deactivate own account. |
| 401 | Authentication required. |
| 403 | Space Admin tried to update a user from another organization. |
| 404 | User not found. |
| 422 | `isActive` value is missing or invalid. |
| 500 | Internal server error. |

## Frontend Usage (PRD)

Used in the **Admin User Management** page where Super Admins and Space Admins can enable or disable user accounts. This supports the PRD's role-based user management by allowing administrators to control account access without deleting user records.

## Models Used

- User

## Notes

- ✅ Prevents administrators from deactivating their own account.
- ✅ Space Admins can only update users within their own organization.
- ⚠️ Implements a soft deactivation instead of permanently deleting user records, which is a good practice.

---

# Controller: deleteUser

## Purpose

Soft deletes a user account by marking it as inactive instead of permanently removing it from the database.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| DELETE | `/api/users/:id` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (`super_admin`) |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Example Request

```http
DELETE /api/users/6875e1d8f0c7d3a8d9f12345
Authorization: Bearer <JWT_TOKEN>
```

## Expected Responses

| Status | Description |
|--------|-------------|
| 200 | User deleted successfully. |
| 400 | Invalid user ID or attempting to delete own account. |
| 401 | Authentication required. |
| 403 | Attempt to delete a Super Admin account. |
| 404 | User not found. |
| 500 | Internal server error. |

## Frontend Usage (PRD)

Used in the **Super Admin User Management** panel when an administrator wants to remove a user from the platform. Since the account is only marked as inactive, the user data is preserved for future reference, reporting, and audit purposes.

## Models Used

- User

## Notes

- ✅ Prevents deletion of Super Admin accounts.
- ✅ Prevents users from deleting their own account.
- ✅ Implements a soft delete by setting `isActive = false`, preserving historical data.
- ⚠️ Consider changing the success message to **"User deactivated successfully."** since the record is not permanently removed from the database.

--------
# Module 3: Organization Management

---

# Controller: createOrganization

## Purpose

Creates a new organization in the system. This API is used by the Super Admin to register a new organization before assigning a Space Admin, creating resources, and managing bookings.

## API Details

| HTTP Method | Endpoint |
|-------------|----------|
| POST | `/api/organizations` |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| Authentication (`protect`) | Yes |
| Authorization (`authorize`) | Yes |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ Yes | Organization name. |
| `description` | String | ❌ No | Organization description. |
| `address` | String | ❌ No | Organization address. |
| `city` | String | ❌ No | City name. |
| `country` | String | ❌ No | Country name. |
| `timezone` | String | ❌ No | Organization timezone (Default: UTC). |
| `logoUrl` | String | ❌ No | Organization logo URL. |

## Example Request

```http
POST /api/organizations
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "name": "FAST University",
  "description": "Main Campus",
  "address": "Islamabad",
  "city": "Islamabad",
  "country": "Pakistan",
  "timezone": "Asia/Karachi",
  "logoUrl": "https://example.com/logo.png"
}
```

## Example Responses

### ✅ 201 Created

```json
{
  "success": true,
  "data": {
    "message": "Organization created successfully.",
    "organization": {
      "_id": "6875f9dc41b0c4b6fd8f3211",
      "name": "FAST University",
      "description": "Main Campus",
      "address": "Islamabad",
      "city": "Islamabad",
      "country": "Pakistan",
      "timezone": "Asia/Karachi",
      "logoUrl": "https://example.com/logo.png",
      "isActive": true,
      "createdBy": "6875f0ab41b0c4b6fd8f1111",
      "createdAt": "2026-07-23T12:15:00.000Z",
      "updatedAt": "2026-07-23T12:15:00.000Z"
    }
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Request status. |
| `data.message` | String | Success message. |
| `data.organization` | Object | Newly created organization. |
| `data.organization._id` | String | Organization ID. |
| `data.organization.name` | String | Organization name. |
| `data.organization.isActive` | Boolean | Organization status. |
| `data.organization.createdBy` | String | Super Admin who created the organization. |

### ❌ 409 Conflict

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_EXISTS",
    "message": "Organization with this name already exists."
  }
}
```

### ❌ 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Organization name is required."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

### ❌ 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
```

## Frontend Usage (According to PRD)

Used on the **Super Admin → Organization Management** page. When the Super Admin submits the **Create Organization** form, the frontend sends this request to register a new organization. After a successful response, the frontend can redirect the administrator to assign a Space Admin, create resources, or display the newly created organization in the organizations list.

## Models Used

- Organization
- AuditLog

## Notes

- ✅ Only Super Admins can create organizations.
- ✅ Prevents duplicate organization names.
- ✅ Automatically records the creator (`createdBy`).
- ✅ Stores the action in the Audit Log.
- 💡 **Testing Role:** Login as a **Super Admin** before testing this API in Postman.
---

# Controller: getOrganizations

## Purpose

Retrieves all organizations registered in the system. This API is only accessible by the Super Admin.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Organization |
| Controller | `getOrganizations` |
| Method | GET |
| Endpoint | `/api/organizations` |
| Authentication | Yes |
| Authorization | Super Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| Authentication (`protect`) | Yes |
| Authorization (`authorize`) | Yes |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

No request body is required.

## Example Request

```http
GET /api/organizations
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "_id": "6875f9dc41b0c4b6fd8f3211",
        "name": "FAST University",
        "description": "Main Campus",
        "city": "Islamabad",
        "country": "Pakistan",
        "timezone": "Asia/Karachi",
        "isActive": true,
        "createdBy": {
          "_id": "6875f0ab41b0c4b6fd8f1111",
          "name": "Admin",
          "email": "admin@example.com"
        }
      }
    ]
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

### ❌ 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
```

## Frontend Usage (PRD)

Used on the **Organization Management** screen to display all organizations available in the platform.

## Models Used

- Organization

## Notes

- ✅ Returns creator information using `populate()`.
- 💡 **Testing Role:** Super Admin.

---

# Controller: getOrganizationById

## Purpose

Retrieves detailed information for a single organization.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Organization |
| Controller | `getOrganizationById` |
| Method | GET |
| Endpoint | `/api/organizations/:id` |
| Authentication | Yes |
| Authorization | Super Admin, Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| Authentication (`protect`) | Yes |
| Authorization (`authorize`) | Yes |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

No request body is required.

## Example Request

```http
GET /api/organizations/6875f9dc41b0c4b6fd8f3211
Authorization: Bearer <JWT_TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "organization": {
      "_id": "6875f9dc41b0c4b6fd8f3211",
      "name": "FAST University",
      "description": "Main Campus",
      "city": "Islamabad",
      "country": "Pakistan",
      "timezone": "Asia/Karachi",
      "createdBy": {
        "_id": "6875f0ab41b0c4b6fd8f1111",
        "name": "Admin",
        "email": "admin@example.com"
      }
    }
  }
}
```

### ❌ 400 Invalid ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid organization id."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found."
  }
}
```

## Frontend Usage (PRD)

Used when opening an organization's profile to display its complete information.

## Models Used

- Organization

## Notes

- 💡 **Testing Role:** Super Admin or Space Admin.

---

# Controller: updateOrganization

## Purpose

Updates an organization's information.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Organization |
| Controller | `updateOrganization` |
| Method | PATCH |
| Endpoint | `/api/organizations/:id` |
| Authentication | Yes |
| Authorization | Super Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| Authentication (`protect`) | Yes |
| Authorization (`authorize`) | Yes |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required |
|-------|------|----------|
| `name` | String | ❌ No |
| `description` | String | ❌ No |
| `address` | String | ❌ No |
| `city` | String | ❌ No |
| `country` | String | ❌ No |
| `timezone` | String | ❌ No |
| `logoUrl` | String | ❌ No |
| `isActive` | Boolean | ❌ No |

## Example Request

```json
{
  "name": "FAST Lahore",
  "city": "Lahore",
  "isActive": true
}
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Organization updated successfully.",
    "organization": {
      "_id": "6875f9dc41b0c4b6fd8f3211",
      "name": "FAST Lahore",
      "city": "Lahore",
      "isActive": true
    }
  }
}
```

### ❌ 400 Invalid ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid organization id."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found."
  }
}
```

### ❌ 409 Conflict

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_EXISTS",
    "message": "Organization name already exists."
  }
}
```

## Frontend Usage (PRD)

Used by the **Super Admin** to update organization details from the **Organization Management** page.

## Models Used

- Organization
- AuditLog

## Notes

- ✅ Supports partial updates.
- ✅ Stores update history in the Audit Log.
- 💡 **Testing Role:** Super Admin.

Module: Organization Management
Controller: deleteOrganization
Purpose

Soft deletes an organization by marking it as inactive. An organization cannot be deleted if it still contains active users or active resources.

Quick Reference
Item	Value
Module	Organization
Controller	deleteOrganization
Method	DELETE
Endpoint	/api/organizations/:id
Authentication	Yes
Authorization	Super Admin
Authentication & Authorization
Middleware	Required
Authentication (protect)	Yes
Authorization (authorize)	Yes
Allowed Roles
✅ Super Admin
❌ Space Admin
❌ Member
❌ Guest
Request Fields

No request body is required.

Example Request
DELETE /api/organizations/6875f9dc41b0c4b6fd8f3211
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Example Responses
✅ 200 OK
{
  "success": true,
  "data": {
    "message": "Organization deleted successfully."
  }
}
Response Fields
Field	Type	Description
success	Boolean	Indicates request completed successfully.
data.message	String	Confirmation message.
❌ 400 Invalid Organization ID
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid organization id."
  }
}
❌ 400 Organization Not Empty
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_EMPTY",
    "message": "Cannot delete organization because it still contains active users or resources."
  }
}
❌ 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
❌ 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
❌ 404 Organization Not Found
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found."
  }
}
❌ 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
Frontend Usage (According to PRD)

Used on the Organization Management page when the Super Admin removes an organization. Before allowing deletion, the frontend should inform the administrator that organizations with active users or resources cannot be deleted.

Models Used
Organization
User
Resource
AuditLog
Notes
✅ Soft delete (isActive = false).
✅ Prevents deleting organizations containing active users or resources.
✅ Action recorded in Audit Log.
💡 Testing Role: Super Admin.
Module: Organization Management
Controller: assignSpaceAdmin
Purpose

Assigns a verified user as the Space Admin of an organization. The selected user is linked to the organization and their role is updated to space_admin.

Quick Reference
Item	Value
Module	Organization
Controller	assignSpaceAdmin
Method	POST
Endpoint	/api/organizations/:id/space-admin
Authentication	Yes
Authorization	Super Admin
Authentication & Authorization
Middleware	Required
Authentication (protect)	Yes
Authorization (authorize)	Yes
Allowed Roles
✅ Super Admin
❌ Space Admin
❌ Member
❌ Guest
Request Fields
Field	Type	Required	Description
userId	ObjectId	✅ Yes	User to be assigned as Space Admin.
Example Request
POST /api/organizations/6875f9dc41b0c4b6fd8f3211/space-admin
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: application/json
{
  "userId": "6875e1d8f0c7d3a8d9f12345"
}
Example Responses
✅ 200 OK
{
  "success": true,
  "data": {
    "message": "Space Admin assigned successfully.",
    "user": {
      "_id": "6875e1d8f0c7d3a8d9f12345",
      "name": "Ali Khan",
      "email": "ali@example.com",
      "role": "space_admin",
      "organizationId": "6875f9dc41b0c4b6fd8f3211",
      "isVerified": true,
      "isActive": true
    }
  }
}
Response Fields
Field	Type	Description
success	Boolean	Request status.
data.message	String	Success message.
data.user	Object	Updated user details.
data.user.role	String	Updated role (space_admin).
data.user.organizationId	String	Assigned organization ID.
❌ 400 Invalid ID
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid organization id."
  }
}
❌ 400 User Not Verified
{
  "success": false,
  "error": {
    "code": "USER_NOT_VERIFIED",
    "message": "User must verify the account before becoming Space Admin."
  }
}
❌ 400 User Already Assigned
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_ASSIGNED",
    "message": "User already belongs to another organization."
  }
}
❌ 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
❌ 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
❌ 404 Organization Not Found
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found."
  }
}
❌ 404 User Not Found
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found."
  }
}
❌ 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
Frontend Usage (According to PRD)

After creating an organization, the Super Admin uses this API from the Organization Management page to assign a verified user as the Space Admin. Once assigned, the user gains permission to manage resources, bookings, calendars, and members for that organization.

Models Used
Organization
User
Notes
✅ Only verified users can become Space Admins.
✅ Prevents assigning users already linked to another organization.
⚠️ Suggestion: Unlike the other organization actions, this controller does not create an AuditLog. For consistency, consider logging this action as well. It would improve auditability of administrative changes.
💡 Testing Role: Super Admin only.

---

# Controller: deleteOrganization

## Purpose

Soft deletes an organization by marking it as inactive. An organization cannot be deleted if it still contains active users or active resources.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Organization |
| Controller | `deleteOrganization` |
| Method | DELETE |
| Endpoint | `/api/organizations/:id` |
| Authentication | Yes |
| Authorization | Super Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| Authentication (`protect`) | Yes |
| Authorization (`authorize`) | Yes |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

No request body is required.

## Example Request

```http
DELETE /api/organizations/6875f9dc41b0c4b6fd8f3211
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Organization deleted successfully."
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Indicates request completed successfully. |
| `data.message` | String | Confirmation message. |

### ❌ 400 Invalid Organization ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid organization id."
  }
}
```

### ❌ 400 Organization Not Empty

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_EMPTY",
    "message": "Cannot delete organization because it still contains active users or resources."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

### ❌ 404 Organization Not Found

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found."
  }
}
```

### ❌ 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
```

## Frontend Usage (According to PRD)

Used on the **Organization Management** page when the **Super Admin** removes an organization. Before allowing deletion, the frontend should inform the administrator that organizations with active users or resources cannot be deleted.

## Models Used

- Organization
- User
- Resource
- AuditLog

## Notes

- ✅ Implements a soft delete (`isActive = false`).
- ✅ Prevents deleting organizations containing active users or resources.
- ✅ Records the action in the Audit Log.
- 💡 **Testing Role:** Super Admin.

---

# Controller: assignSpaceAdmin

## Purpose

Assigns a verified user as the Space Admin of an organization. The selected user is linked to the organization and their role is updated to `space_admin`.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Organization |
| Controller | `assignSpaceAdmin` |
| Method | POST |
| Endpoint | `/api/organizations/:id/space-admin` |
| Authentication | Yes |
| Authorization | Super Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| Authentication (`protect`) | Yes |
| Authorization (`authorize`) | Yes |

### Allowed Roles

- ✅ Super Admin
- ❌ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | ObjectId | ✅ Yes | User to be assigned as Space Admin. |

## Example Request

```http
POST /api/organizations/6875f9dc41b0c4b6fd8f3211/space-admin
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "userId": "6875e1d8f0c7d3a8d9f12345"
}
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Space Admin assigned successfully.",
    "user": {
      "_id": "6875e1d8f0c7d3a8d9f12345",
      "name": "Ali Khan",
      "email": "ali@example.com",
      "role": "space_admin",
      "organizationId": "6875f9dc41b0c4b6fd8f3211",
      "isVerified": true,
      "isActive": true
    }
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Request status. |
| `data.message` | String | Success message. |
| `data.user` | Object | Updated user details. |
| `data.user.role` | String | Updated role (`space_admin`). |
| `data.user.organizationId` | String | Assigned organization ID. |

### ❌ 400 Invalid ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid organization id."
  }
}
```

### ❌ 400 User Not Verified

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_VERIFIED",
    "message": "User must verify the account before becoming Space Admin."
  }
}
```

### ❌ 400 User Already Assigned

```json
{
  "success": false,
  "error": {
    "code": "USER_ALREADY_ASSIGNED",
    "message": "User already belongs to another organization."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

### ❌ 404 Organization Not Found

```json
{
  "success": false,
  "error": {
    "code": "ORGANIZATION_NOT_FOUND",
    "message": "Organization not found."
  }
}
```

### ❌ 404 User Not Found

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found."
  }
}
```

### ❌ 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Something went wrong."
  }
}
```

## Frontend Usage (According to PRD)

After creating an organization, the **Super Admin** uses this API from the **Organization Management** page to assign a verified user as the Space Admin. Once assigned, the user gains permission to manage resources, bookings, calendars, and members for that organization.

## Models Used

- Organization
- User

## Notes

- ✅ Only verified users can become Space Admins.
- ✅ Prevents assigning users already linked to another organization.
- ⚠️ Unlike the other organization actions, this controller does not create an `AuditLog`. For consistency, consider logging this action as well to improve auditability of administrative changes.
- 💡 **Testing Role:** Super Admin only.

# Module 4: Resource Management

---

# Controller: createResource

## Purpose

Creates a new resource (e.g., room, lab, desk, equipment, vehicle, court, etc.) within the logged-in Space Admin's organization. This resource can later be used for bookings, calendars, and approvals.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Resource |
| Controller | `createResource` |
| Method | POST |
| Endpoint | `/api/resources` |
| Authentication | Yes |
| Authorization | Yes (Space Admin) |
| Tested By | Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes |

### Allowed Roles

- ❌ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ Yes | Resource name. |
| `type` | Enum | ✅ Yes | `room`, `lab`, `desk`, `equipment`, `vehicle`, `court`, `other` |
| `building` | String | ❌ No | Building name. |
| `location` | String | ❌ No | Resource location. |
| `capacity` | Number | ❌ No | Maximum capacity (Default: 1). |
| `amenities` | Array<String> | ❌ No | Available facilities. |
| `photoUrl` | String | ❌ No | Resource image URL. |
| `requiresApproval` | Boolean | ❌ No | Whether booking requires approval. |
| `bufferTime` | Number | ❌ No | Buffer time between bookings. |
| `accessGroupId` | ObjectId | ❌ No | Assigned Access Group. |

## Example Request

```http
POST /api/resources
Authorization: Bearer <SPACE_ADMIN_TOKEN>
Content-Type: application/json
```

```json
{
  "name": "Conference Room A",
  "type": "room",
  "building": "Block A",
  "location": "First Floor",
  "capacity": 20,
  "amenities": [
    "Projector",
    "WiFi"
  ],
  "requiresApproval": true,
  "bufferTime": 15
}
```

## Example Responses

### ✅ 201 Created

```json
{
  "success": true,
  "data": {
    "message": "Resource created successfully.",
    "resource": {
      "_id": "6876...",
      "name": "Conference Room A",
      "type": "room",
      "organizationId": "...",
      "capacity": 20,
      "requiresApproval": true,
      "bufferTime": 15,
      "isActive": true
    }
  }
}
```

### ❌ 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name and type are required."
  }
}
```

### ❌ 404 User Not Found

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found."
  }
}
```

### ❌ 409 Resource Exists

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_EXISTS",
    "message": "A resource with this name already exists."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to perform this action."
  }
}
```

## Frontend Usage (According to PRD)

Used by the **Space Admin** from the **Resource Management** page to create resources that members can later search, view in the calendar, and book.

## Models Used

- Resource
- User
- AuditLog

## Backend Review

- ✅ Good duplicate name check.
- ⚠️ `accessGroupId` is not validated before assigning it.
- ⚠️ `type` is not explicitly validated against the allowed enum before saving (although Mongoose will reject invalid values).

---

# Controller: getResources

## Purpose

Returns all active resources belonging to the logged-in user's organization with optional search and type filters.

## Quick Reference

| Item | Value |
|------|-------|
| Module | Resource |
| Controller | `getResources` |
| Method | GET |
| Endpoint | `/api/resources` |
| Authentication | Yes |
| Authorization | Any Authenticated User |
| Tested By | Space Admin / Member / Guest |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin (if authenticated)
- ✅ Space Admin
- ✅ Member
- ✅ Guest

## Query Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `search` | String | ❌ No | Search resources by name. |
| `type` | String | ❌ No | Filter by resource type. |

## Example Request

```http
GET /api/resources?search=room&type=room
Authorization: Bearer <TOKEN>
```

## Example Response

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "_id": "6876...",
        "name": "Conference Room A",
        "type": "room",
        "capacity": 20,
        "building": "Block A",
        "location": "First Floor",
        "requiresApproval": true,
        "createdBy": {
          "name": "Ali",
          "email": "ali@test.com"
        },
        "accessGroupId": {
          "_id": "...",
          "name": "Faculty"
        }
      }
    ]
  }
}
```

### ❌ 404 User Not Found

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

## Frontend Usage (According to PRD)

This API powers the **Browse Resources** page. Members, Guests, and Space Admins use it to search, filter, and select resources before checking availability or creating a booking.

## Models Used

- Resource
- User

---

# Module 4: Resource Management

---

# Controller: getResourceById

## Purpose

Retrieves complete details of a single resource.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | GET |
| Endpoint | `/api/resources/:id` |
| Authentication | Yes |
| Authorization | No |
| Allowed Roles | Super Admin, Space Admin, Member, Guest |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ✅ Member
- ✅ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` (URL Param) | ObjectId | ✅ Yes | Resource ID |

## Example Request

```http
GET /api/resources/685bc7e2a4d25c2c95f73d10
Authorization: Bearer <TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "resource": {
      "_id": "685bc7e2a4d25c2c95f73d10",
      "name": "Conference Room A",
      "type": "room",
      "organizationId": {
        "_id": "685...",
        "name": "FAST University"
      },
      "accessGroupId": {
        "_id": "684...",
        "name": "Faculty"
      },
      "building": "Block A",
      "location": "First Floor",
      "capacity": 20,
      "amenities": [
        "Projector",
        "WiFi"
      ],
      "photoUrl": "https://...",
      "requiresApproval": true,
      "bufferTime": 15,
      "isActive": true,
      "createdBy": {
        "_id": "684...",
        "name": "Ali Khan",
        "email": "ali@test.com"
      },
      "createdAt": "2026-07-20T08:00:00.000Z",
      "updatedAt": "2026-07-22T10:30:00.000Z"
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid resource id."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

## Frontend Usage (According to PRD)

This API is used when a user opens a specific resource to view its complete information before creating a booking or checking availability.

## Models Used

- Resource

## Backend Review

- ✅ Retrieves populated organization, creator, and access group information.
- ⚠️ **Recommendation:** Verify that the logged-in user belongs to the same organization before returning the resource. Currently, any authenticated user with a valid resource ID can access another organization's resource.

---

# Controller: updateResource

## Purpose

Updates the details of an existing resource.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | PATCH |
| Endpoint | `/api/resources/:id` |
| Authentication | Yes |
| Authorization | Yes |
| Allowed Roles | Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes |

### Allowed Roles

- ❌ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ❌ No | Resource name |
| `type` | Enum | ❌ No | Resource type |
| `building` | String | ❌ No | Building |
| `location` | String | ❌ No | Location |
| `capacity` | Number | ❌ No | Capacity |
| `amenities` | Array | ❌ No | Resource amenities |
| `photoUrl` | String | ❌ No | Image URL |
| `requiresApproval` | Boolean | ❌ No | Approval required |
| `bufferTime` | Number | ❌ No | Buffer time |
| `accessGroupId` | ObjectId | ❌ No | Access Group ID |

## Example Request

```http
PATCH /api/resources/685bc7e2a4d25c2c95f73d10
Authorization: Bearer <SPACE_ADMIN_TOKEN>
```

```json
{
  "capacity": 30,
  "location": "Second Floor",
  "requiresApproval": false
}
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Resource updated successfully.",
    "resource": {
      "_id": "685bc7e2a4d25c2c95f73d10",
      "capacity": 30,
      "location": "Second Floor",
      "requiresApproval": false
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid resource id."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to update this resource."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found."
  }
}
```

## Frontend Usage (According to PRD)

Used from the **Edit Resource** screen where the Space Admin updates information such as capacity, location, amenities, approval requirement, or access group.

## Models Used

- Resource
- User
- AuditLog

## Backend Review

- ✅ Proper ownership verification is implemented.
- ⚠️ Consider validating the updated `type`, `capacity`, and `accessGroupId` values before saving to prevent invalid data.

---

# Controller: updateResourceStatus

## Purpose

Activates or deactivates a resource without permanently deleting it.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | PATCH |
| Endpoint | `/api/resources/:id/status` |
| Authentication | Yes |
| Authorization | Yes |
| Allowed Roles | Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes |

### Allowed Roles

- ❌ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `isActive` | Boolean | ✅ Yes | Resource status |

## Example Request

```http
PATCH /api/resources/685bc7e2a4d25c2c95f73d10/status
Authorization: Bearer <SPACE_ADMIN_TOKEN>
```

```json
{
  "isActive": false
}
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Resource status updated successfully.",
    "resource": {
      "_id": "685bc7e2a4d25c2c95f73d10",
      "name": "Conference Room A",
      "isActive": false
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid resource id."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to update this resource."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found."
  }
}
```

### ❌ 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "isActive must be true or false."
  }
}
```

## Frontend Usage (According to PRD)

This API is used when the **Space Admin** enables or disables a resource from the **Resource Management** page. Inactive resources cannot be booked but remain stored in the system.

## Models Used

- Resource
- User
- AuditLog

## Backend Review

- ✅ Validates `isActive` before updating.
- ✅ Verifies that the resource belongs to the logged-in Space Admin's organization.
- ✅ Creates an audit log for activation/deactivation.
- 💡 Consider preventing deactivation if the resource has active or upcoming bookings.

---

# Controller: deleteResource

## Purpose

Soft deletes a resource by marking it as inactive instead of permanently removing it.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | DELETE |
| Endpoint | `/api/resources/:id` |
| Authentication | Yes |
| Authorization | Yes |
| Allowed Roles | Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes |

### Allowed Roles

- ❌ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` (URL Param) | ObjectId | ✅ Yes | Resource ID |

## Example Request

```http
DELETE /api/resources/685bc7e2a4d25c2c95f73d10
Authorization: Bearer <SPACE_ADMIN_TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Resource deleted successfully."
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid resource id."
  }
}
```

### ❌ 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication required."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to delete this resource."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found."
  }
}
```

## Frontend Usage (According to PRD)

This API is used from the **Delete Resource** action in the **Resource Management** module. The resource is not permanently removed from the database; instead, it is marked as inactive so it no longer appears in the list of available resources for booking.

## Models Used

- Resource
- User
- AuditLog

## Backend Review

- ✅ Uses soft delete (`isActive = false`), preserving historical data.
- ✅ Ensures only the Space Admin of the same organization can delete the resource.
- ✅ Creates an audit log for traceability.
- 💡 **Recommended Improvement:** Before allowing deletion, check whether the resource has any future bookings. If bookings exist, return an error (e.g., `RESOURCE_HAS_ACTIVE_BOOKINGS`) to avoid orphaned bookings and maintain data integrity.

# Module 5: Booking Management

## Module Overview

The **Booking Management** module is the core functionality of the Resource Booking Platform. It allows authenticated users to reserve organizational resources such as rooms, labs, desks, equipment, vehicles, and courts. The module manages the complete booking lifecycle, including booking creation, updates, cancellations, approvals, recurring bookings, check-ins, and conflict prevention while ensuring resource availability.

---

## Models Used

| Model | Purpose |
|--------|---------|
| **Booking** | Stores complete booking information including resource, user, time slot, booking status, attendees, notes, and check-in status. |
| **Resource** | Verifies resource availability, approval requirements, and capacity. |
| **User** | Identifies the booking owner and organization. |
| **Approval** | Created when a booking requires administrator approval. |
| **CheckIn** | Stores the user's check-in record after arriving for the booking. |
| **RecurringBooking** | Stores recurring booking schedules for repeated reservations. |
| **BlackoutDate** | Prevents bookings during maintenance or blocked dates. |
| **AuditLog** | Records all booking-related activities for auditing purposes. |

---

## Fields Used for Creating a Booking

| Field | Type | Required |
|-------|------|----------|
| `resourceId` | ObjectId | ✅ Yes |
| `title` | String | ✅ Yes |
| `attendeeCount` | Number | ❌ No |
| `notes` | String | ❌ No |
| `startTime` | Date | ✅ Yes |
| `endTime` | Date | ✅ Yes |

---

The Booking Management module allows authenticated users to reserve organizational resources. It validates resource availability, checks booking conflicts, verifies blackout dates, supports recurring bookings, creates approval requests when required, sends notifications, and records audit logs. It is responsible for managing the complete booking lifecycle.

---

# Controller: createBooking

## Purpose

Creates a new booking for a selected resource after validating resource availability, booking conflicts, blackout dates, capacity, and approval requirements. It also supports recurring bookings and generates notifications and audit logs.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | POST |
| Endpoint | `/api/bookings` |
| Authentication | Yes |
| Authorization | No |
| Allowed Roles | Super Admin, Space Admin, Member, Guest |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ✅ Member
- ✅ Guest

## Request Fields

| Field | Required | Description |
|-------|----------|-------------|
| `resourceId` | ✅ Yes | Resource to book |
| `title` | ✅ Yes | Booking title |
| `attendeeCount` | ❌ No | Number of attendees |
| `notes` | ❌ No | Additional notes |
| `startTime` | ✅ Yes | Booking start time |
| `endTime` | ✅ Yes | Booking end time |
| `rrule` | ❌ No | Recurring booking rule |

## Example Request

```http
POST /api/bookings
Authorization: Bearer <TOKEN>
```

```json
{
  "resourceId": "685ab1234de45f2345678901",
  "title": "Weekly Team Meeting",
  "attendeeCount": 8,
  "notes": "Sprint Planning",
  "startTime": "2026-07-25T09:00:00Z",
  "endTime": "2026-07-25T10:00:00Z",
  "rrule": "FREQ=WEEKLY;COUNT=5"
}
```

## Example Responses

### ✅ 201 Created

```json
{
  "success": true,
  "data": {
    "message": "Booking created successfully.",
    "booking": {
      "_id": "686123abc456",
      "resourceId": "685ab1234de45f2345678901",
      "userId": "685cd5678ab901234567890",
      "title": "Weekly Team Meeting",
      "attendeeCount": 8,
      "notes": "Sprint Planning",
      "status": "approved",
      "checkedIn": false,
      "startTime": "2026-07-25T09:00:00Z",
      "endTime": "2026-07-25T10:00:00Z"
    }
  }
}
```

### ✅ If Resource Requires Approval

```json
{
  "success": true,
  "data": {
    "message": "Booking submitted for approval.",
    "booking": {
      "status": "pending"
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid resource id."
  }
}
```

Or

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_INACTIVE",
    "message": "Resource is inactive."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Resource belongs to another organization."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found."
  }
}
```

### ❌ 409 Conflict

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "This resource is already booked for the selected time."
  }
}
```

Or

```json
{
  "success": false,
  "error": {
    "code": "BLACKOUT_DATE",
    "message": "This resource is unavailable during the selected time."
  }
}
```

### ❌ 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields."
  }
}
```

Or

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TIME",
    "message": "End time must be after start time."
  }
}
```

Or

```json
{
  "success": false,
  "error": {
    "code": "CAPACITY_EXCEEDED",
    "message": "Attendee count exceeds resource capacity."
  }
}
```

## Automatically Assigned Fields

- `userId`
- `status`
- `checkedIn`
- `recurringBookingId` *(when applicable)*
- `createdAt`
- `updatedAt`

## Frontend Usage (According to PRD)

The frontend calls this API when a user submits the booking form after selecting a resource, date, and time. The controller automatically validates booking conflicts, blackout dates, resource capacity, approval requirements, creates recurring bookings when requested, generates notifications, and records audit logs.

---

# Controller: getBookings

## Purpose

Retrieves bookings for the authenticated user. Members and Guests receive only their own bookings, while administrators can access all bookings. Supports filtering by booking status.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | GET |
| Endpoint | `/api/bookings` |
| Authentication | Yes |
| Authorization | No |
| Allowed Roles | Super Admin, Space Admin, Member, Guest |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ✅ Member
- ✅ Guest

## Query Parameters

| Parameter | Required |
|-----------|----------|
| `status` | ❌ No |

## Example Request

```http
GET /api/bookings?status=approved
Authorization: Bearer <TOKEN>
```

## Example Response

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "686123abc456",
        "title": "Weekly Team Meeting",
        "status": "approved",
        "startTime": "2026-07-25T09:00:00Z",
        "endTime": "2026-07-25T10:00:00Z",
        "resourceId": {
          "name": "Conference Room A",
          "type": "room"
        },
        "userId": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found."
  }
}
```

## Frontend Usage (According to PRD)

This API powers both the **Booking Management** page and the **My Bookings** page. Members and Guests receive only their own bookings, while administrators can view all bookings. It also supports filtering bookings by status.

---

# Controller: getBookingById

## Purpose

Retrieves complete details of a specific booking.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | GET |
| Endpoint | `/api/bookings/:id` |
| Authentication | Yes |
| Authorization | No |
| Allowed Roles | Super Admin, Space Admin, Member, Guest |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ✅ Member
- ✅ Guest

## Request Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` (URL Parameter) | ✅ Yes | Booking ID |

## Example Request

```http
GET /api/bookings/686123abc456
Authorization: Bearer <TOKEN>
```

## Example Response

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "686123abc456",
      "title": "Weekly Team Meeting",
      "status": "approved",
      "checkedIn": false,
      "resourceId": {
        "_id": "685ab1234de45f2345678901",
        "name": "Conference Room A"
      },
      "userId": {
        "_id": "685cd5678ab901234567890",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid booking id."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found."
  }
}
```

## Frontend Usage (According to PRD)

The frontend uses this API to display complete booking details on the **Booking Details** page before allowing users to edit, approve, reject, cancel, or check in to a booking.

---

# Controller: updateBooking

## Purpose

Updates an existing booking while validating booking ownership, booking conflicts, blackout dates, recurring bookings, and time constraints before saving the changes.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | PATCH |
| Endpoint | `/api/bookings/:id` |
| Authentication | Yes |
| Authorization | No (Ownership checked inside controller) |
| Allowed Roles | Booking Owner, Super Admin, Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Booking Owner
- ✅ Super Admin
- ✅ Space Admin

## Request Fields

| Field | Required |
|-------|----------|
| `title` | ❌ No |
| `attendeeCount` | ❌ No |
| `notes` | ❌ No |
| `startTime` | ❌ No |
| `endTime` | ❌ No |
| `rrule` | ❌ No |

## Example Request

```http
PATCH /api/bookings/686123abc456
Authorization: Bearer <TOKEN>
```

```json
{
  "title": "Updated Weekly Meeting",
  "attendeeCount": 12,
  "notes": "Updated Agenda",
  "startTime": "2026-07-28T09:00:00Z",
  "endTime": "2026-07-28T10:00:00Z",
  "rrule": "FREQ=WEEKLY;COUNT=10"
}
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Booking updated successfully.",
    "booking": {
      "_id": "686123abc456",
      "title": "Updated Weekly Meeting",
      "status": "approved",
      "startTime": "2026-07-28T09:00:00Z",
      "endTime": "2026-07-28T10:00:00Z"
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid booking id."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to update this booking."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found."
  }
}
```

### ❌ 409 Conflict

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Selected time slot is already booked."
  }
}
```

Or

```json
{
  "success": false,
  "error": {
    "code": "BLACKOUT_DATE",
    "message": "Resource is unavailable during the selected time."
  }
}
```

### ❌ 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TIME",
    "message": "End time must be after start time."
  }
}
```

## Frontend Usage (According to PRD)

Used when users edit an existing booking. The frontend submits only the updated fields, while the backend validates booking ownership, booking conflicts, blackout dates, recurring bookings, notifications, and audit logs before saving the changes.

---

# Controller: updateBookingStatus

## Purpose

Updates the status of a booking. This controller is primarily used by administrators to approve, reject, cancel, or complete booking requests.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | PATCH |
| Endpoint | `/api/bookings/:id/status` |
| Authentication | Yes |
| Authorization | Yes |
| Allowed Roles | Super Admin, Space Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

## Request Fields

| Field | Required |
|-------|----------|
| `status` | ✅ Yes |

### Allowed Values

- `pending`
- `approved`
- `rejected`
- `cancelled`
- `completed`

## Example Request

```http
PATCH /api/bookings/686123abc456/status
Authorization: Bearer <TOKEN>
```

```json
{
  "status": "approved"
}
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Booking status updated successfully.",
    "booking": {
      "_id": "686123abc456",
      "status": "approved"
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid booking id."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found."
  }
}
```

### ❌ 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking status."
  }
}
```

## Frontend Usage (According to PRD)

Used by the **Approval Management** screen. After reviewing a booking request, administrators use this API to approve, reject, complete, or cancel bookings.

---

# Controller: cancelBooking

## Purpose

Cancels an existing booking by changing its status to `cancelled`. The controller also removes recurring booking information (when applicable), generates notifications, and records audit logs.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | DELETE |
| Endpoint | `/api/bookings/:id` |
| Authentication | Yes |
| Authorization | No (Ownership checked inside controller) |
| Allowed Roles | Booking Owner, Super Admin |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Booking Owner
- ✅ Super Admin

## Request Fields

No request body is required.

## Example Request

```http
DELETE /api/bookings/686123abc456
Authorization: Bearer <TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Booking cancelled successfully.",
    "booking": {
      "_id": "686123abc456",
      "status": "cancelled"
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid booking id."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to cancel this booking."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found."
  }
}
```

## Frontend Usage (According to PRD)

Used when a user clicks **Cancel Booking** from **My Bookings**, or when a **Super Admin** cancels an inappropriate booking. The controller also removes recurring booking information (if any), generates notifications, and stores an audit log.

---

# Controller: checkInBooking

## Purpose

Allows the booking owner to check in after arriving at the reserved resource. The controller records the check-in, updates the booking, generates notifications, and stores audit logs.

## Quick Reference

| Item | Value |
|------|-------|
| HTTP Method | PATCH |
| Endpoint | `/api/bookings/:id/check-in` |
| Authentication | Yes |
| Authorization | No (Ownership checked inside controller) |
| Allowed Roles | Booking Owner |

## Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | No |

### Allowed Roles

- ✅ Booking Owner

## Request Fields

No request body is required.

## Example Request

```http
PATCH /api/bookings/686123abc456/check-in
Authorization: Bearer <TOKEN>
```

## Example Responses

### ✅ 200 OK

```json
{
  "success": true,
  "data": {
    "message": "Checked in successfully.",
    "checkIn": {
      "_id": "687xyz987",
      "bookingId": "686123abc456",
      "userId": "685cd5678ab901234567890",
      "checkInTime": "2026-07-28T09:02:10Z"
    }
  }
}
```

### ❌ 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_BOOKING_STATUS",
    "message": "Only approved bookings can be checked in."
  }
}
```

Or

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Invalid booking id."
  }
}
```

### ❌ 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to check in for this booking."
  }
}
```

### ❌ 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking not found."
  }
}
```

### ❌ 409 Conflict

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CHECKED_IN",
    "message": "You have already checked in."
  }
}
```

## Frontend Usage (According to PRD)

The frontend calls this API when the booking owner presses the **Check In** button after arriving at the reserved resource. The controller records the check-in, marks the booking as completed, sends a notification, and stores an audit log. This functionality supports attendance tracking and resource utilization monitoring as described in the PRD.

# Module 6: Approval Management

The **Approval Management Module** handles booking approval workflows for resources that require administrator approval. It allows Super Admins and Space Admins to review pending booking requests, approve or reject them, and maintain approval records for auditing purposes.

---

## Controller: getApprovals

### Purpose

Retrieves all booking approval requests. Super Admins and Space Admins can optionally filter approvals by their status.

### API Details

| Property | Value |
|----------|-------|
| **HTTP Method** | GET |
| **Endpoint** | `/api/approvals` |
| **Authentication** | Yes |
| **Authorization** | Yes (Super Admin, Space Admin) |

### Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (Super Admin, Space Admin) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

### Query Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| status | String (`pending`, `approved`, `rejected`) | ❌ No |

### Example Request

```http
GET /api/approvals?status=pending
Authorization: Bearer <TOKEN>
```

### Success Response (200)

```json
{
  "success": true,
  "approvals": [
    {
      "_id": "66b3c8ab12cd345678901234",
      "bookingId": {
        "_id": "66b3c1aa12cd345678901111",
        "resourceId": {
          "_id": "66b3bbaa12cd345678901000",
          "name": "Conference Room A",
          "type": "room"
        },
        "userId": {
          "_id": "66b3bcaa12cd345678901222",
          "name": "Ali Khan",
          "email": "ali@example.com"
        }
      },
      "approvedBy": {
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "status": "pending",
      "reason": null,
      "approvedAt": null,
      "createdAt": "2026-07-23T09:00:00.000Z",
      "updatedAt": "2026-07-23T09:00:00.000Z"
    }
  ]
}
```

### Error Responses

#### 403 Forbidden

```json
{
  "success": false,
  "message": "Forbidden",
  "code": "FORBIDDEN"
}
```

### Frontend Usage (According to PRD)

Used by the **Approval Management** page where Super Admins and Space Admins review pending, approved, or rejected booking requests.

### Models Used

- Approval
- Booking
- User
- Resource

---

## Controller: getApprovalById

### Purpose

Retrieves the details of a specific booking approval request.

### API Details

| Property | Value |
|----------|-------|
| **HTTP Method** | GET |
| **Endpoint** | `/api/approvals/:id` |
| **Authentication** | Yes |
| **Authorization** | Yes (Super Admin, Space Admin) |

### Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (Super Admin, Space Admin) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

### Request Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| id | ObjectId | ✅ Yes |

### Example Request

```http
GET /api/approvals/66b3c8ab12cd345678901234
Authorization: Bearer <TOKEN>
```

### Success Response (200)

```json
{
  "success": true,
  "approval": {
    "_id": "66b3c8ab12cd345678901234",
    "bookingId": {
      "_id": "66b3c1aa12cd345678901111",
      "title": "Weekly Meeting"
    },
    "approvedBy": {
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "status": "approved",
    "reason": "Approved",
    "approvedAt": "2026-07-23T10:00:00.000Z"
  }
}
```

### Error Responses

#### 400 Invalid ID

```json
{
  "success": false,
  "message": "Invalid approval id.",
  "code": "INVALID_ID"
}
```

#### 404 Approval Not Found

```json
{
  "success": false,
  "message": "Approval not found.",
  "code": "APPROVAL_NOT_FOUND"
}
```

### Frontend Usage (According to PRD)

Used when an administrator opens an approval request to view its complete details before making a decision.

### Models Used

- Approval
- Booking
- User

---

## Controller: approveBooking

### Purpose

Approves a pending booking request. The booking status is updated, the approval record is created or updated, and the requester receives an approval notification.

### API Details

| Property | Value |
|----------|-------|
| **HTTP Method** | PATCH |
| **Endpoint** | `/api/approvals/:bookingId/approve` |
| **Authentication** | Yes |
| **Authorization** | Yes (Super Admin, Space Admin) |

### Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (Super Admin, Space Admin) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

### Request Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| bookingId | ObjectId | ✅ Yes |

### Request Body

| Field | Type | Required |
|------|------|----------|
| reason | String | ❌ No |

### Example Request

```http
PATCH /api/approvals/66b3c1aa12cd345678901111/approve
Authorization: Bearer <TOKEN>
```

```json
{
  "reason": "Resource is available."
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Booking approved successfully.",
  "approval": {
    "_id": "66b3c8ab12cd345678901234",
    "bookingId": "66b3c1aa12cd345678901111",
    "approvedBy": "66b3bcaa12cd345678901222",
    "status": "approved",
    "reason": "Resource is available.",
    "approvedAt": "2026-07-23T10:15:00.000Z"
  }
}
```

### Error Responses

#### 400 Invalid Booking ID

```json
{
  "success": false,
  "message": "Invalid booking id.",
  "code": "INVALID_ID"
}
```

#### 400 Already Approved

```json
{
  "success": false,
  "message": "Booking is already approved.",
  "code": "BOOKING_ALREADY_APPROVED"
}
```

#### 400 Already Rejected

```json
{
  "success": false,
  "message": "Booking has already been rejected.",
  "code": "BOOKING_ALREADY_REJECTED"
}
```

#### 404 User Not Found

```json
{
  "success": false,
  "message": "User not found.",
  "code": "USER_NOT_FOUND"
}
```

#### 404 Booking Not Found

```json
{
  "success": false,
  "message": "Booking not found.",
  "code": "BOOKING_NOT_FOUND"
}
```

### Frontend Usage (According to PRD)

Used by administrators from the **Approval Management** page to approve pending booking requests.

### Models Used

- Approval
- Booking
- User
- Notification
- AuditLog

---

## Controller: rejectBooking

### Purpose

Rejects a pending booking request. The booking status is updated, the approval record is created or updated, and the requester receives a rejection notification.

### API Details

| Property | Value |
|----------|-------|
| **HTTP Method** | PATCH |
| **Endpoint** | `/api/approvals/:bookingId/reject` |
| **Authentication** | Yes |
| **Authorization** | Yes (Super Admin, Space Admin) |

### Authentication & Authorization

| Middleware | Required |
|------------|----------|
| protect | Yes |
| authorize | Yes (Super Admin, Space Admin) |

### Allowed Roles

- ✅ Super Admin
- ✅ Space Admin
- ❌ Member
- ❌ Guest

### Request Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| bookingId | ObjectId | ✅ Yes |

### Request Body

| Field | Type | Required |
|------|------|----------|
| reason | String | ❌ No |

### Example Request

```http
PATCH /api/approvals/66b3c1aa12cd345678901111/reject
Authorization: Bearer <TOKEN>
```

```json
{
  "reason": "Resource unavailable due to maintenance."
}
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Booking rejected successfully.",
  "approval": {
    "_id": "66b3c8ab12cd345678901234",
    "bookingId": "66b3c1aa12cd345678901111",
    "approvedBy": "66b3bcaa12cd345678901222",
    "status": "rejected",
    "reason": "Resource unavailable due to maintenance.",
    "approvedAt": "2026-07-23T10:20:00.000Z"
  }
}
```

### Error Responses

#### 400 Invalid Booking ID

```json
{
  "success": false,
  "message": "Invalid booking id.",
  "code": "INVALID_ID"
}
```

#### 400 Already Approved

```json
{
  "success": false,
  "message": "Booking has already been approved.",
  "code": "BOOKING_ALREADY_APPROVED"
}
```

#### 400 Already Rejected

```json
{
  "success": false,
  "message": "Booking is already rejected.",
  "code": "BOOKING_ALREADY_REJECTED"
}
```

#### 404 User Not Found

```json
{
  "success": false,
  "message": "User not found.",
  "code": "USER_NOT_FOUND"
}
```

#### 404 Booking Not Found

```json
{
  "success": false,
  "message": "Booking not found.",
  "code": "BOOKING_NOT_FOUND"
}
```

### Frontend Usage (According to PRD)

Used by administrators to reject booking requests that cannot be accommodated due to scheduling conflicts, maintenance, or policy restrictions.

### Models Used

- Approval
- Booking
- User
- Notification
- AuditLog

