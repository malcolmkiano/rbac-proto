// @ts-check
/**
 * Class representing a service for managing user roles and entity access.
 */
class RoleService {
  /**
   * @typedef {Object} RoleRecord
   * @property {string} userId - The ID of the user.
   * @property {string} role - The role assigned to the user.
   * @property {'active'|'inactive'} status - The status of the role assignment.
   */

  /**
   * @typedef {Object} EntityRoleRecord
   * @property {string} entityId - The ID of the entity.
   * @property {string} role - The role assigned to access the entity.
   * @property {'active'|'inactive'} status - The status of the role assignment.
   */

  // ========================
  // Class Properties
  // ========================

  /** @type {RoleRecord[]} */
  #userRoleRecords = [];

  /** @type {EntityRoleRecord[]} */
  #entityAccessRoleRecords = [];

  /** @type {string | null} */
  #baseAccessRole = null;

  /** @type {Object.<string, string>} */
  static Roles = { Admin: "admin", Editor: "editor", Guest: "guest" };

  // ========================
  // Constructor
  // ========================

  /**
   * Creates an instance of RoleService.
   * @param {RoleRecord[]} userRoleRecords - The initial user role records.
   * @param {EntityRoleRecord[]} entityAccessRoleRecords - The initial entity access role records.
   */
  constructor(userRoleRecords, entityAccessRoleRecords) {
    this.#userRoleRecords = userRoleRecords;
    this.#entityAccessRoleRecords = entityAccessRoleRecords;
  }

  // ========================
  // Base Access Role Methods
  // ========================

  /**
   * Sets a base role required to access entities.
   * @param {string} role - The role to be set as base role.
   */
  setBaseAccessRole(role) {
    this.#baseAccessRole = role;
  }

  /**
   * Removes the base role requirement to access entities.
   */
  removeBaseAccessRole() {
    this.#baseAccessRole = null;
  }

  // ========================
  // User Role Management Methods
  // ========================

  /**
   * Grants a role to a user.
   * @param {string} userId - The ID of the user.
   * @param {string} role - The role to be granted.
   */
  grantRole(userId, role) {
    this.#userRoleRecords.push({ userId, role, status: "active" });
  }

  /**
   * Revokes a role from a user.
   * @param {string} userId - The ID of the user.
   * @param {string} role - The role to be revoked.
   */
  revokeRole(userId, role) {
    this.#userRoleRecords.push({ userId, role, status: "inactive" });
  }

  // ========================
  // Entity Access Role Methods
  // ========================

  /**
   * Sets a role to access an entity.
   * @param {string} entityId - The ID of the entity.
   * @param {string} roleOrUserId - The role or userId to grant access to this entity.
   */
  setEntityAccessRole(entityId, roleOrUserId) {
    this.#entityAccessRoleRecords.push({
      entityId,
      role: roleOrUserId,
      status: "active",
    });
  }

  /**
   * Removes a role to access an entity.
   * @param {string} entityId - The ID of the entity.
   * @param {string} role - The role to be removed.
   */
  removeEntityAccessRole(entityId, role) {
    this.#entityAccessRoleRecords.push({ entityId, role, status: "inactive" });
  }

  // ========================
  // Role Creation and Removal Methods
  // ========================

  /**
   * Creates a new role with a specified key.
   * @param {string} name - The name of the role.
   * @param {string} key - The key representing the role.
   */
  createRole(name, key) {
    RoleService.Roles[name] = key;
  }

  /**
   * If the provided name corresponds to a configured role:
   * - Deletes the role from the configured roles.
   * - Revokes the role from all users who have it.
   * - Removes the role from all entities' access roles.
   *
   * If the provided name does not correspond to a configured role:
   * - Assumes the name is a userId.
   * - Revokes all configured roles that the user has.
   * - Removes access roles from all entities where any of the user’s roles are active.
   *
   * @param {string} roleNameOrUserId - The name of the role or the presumed userId.
   */
  removeRole(roleNameOrUserId) {
    const roleId = RoleService.Roles[roleNameOrUserId];
    if (roleId) {
      // If the name is a configured role.
      delete RoleService.Roles[roleNameOrUserId];

      const allUserIds = new Set(
        this.#userRoleRecords.map((record) => record.userId)
      );
      allUserIds.forEach((userId) => {
        if (this.getActiveUserRoles(userId).includes(roleId)) {
          this.revokeRole(userId, roleId);
        }
      });

      const allEntityIds = new Set(
        this.#entityAccessRoleRecords.map((record) => record.entityId)
      );
      allEntityIds.forEach((entityId) => {
        if (this.getActiveEntityAccessRoles(entityId).includes(roleId)) {
          this.removeEntityAccessRole(entityId, roleId);
        }
      });
    } else {
      // If the name is presumed to be a userId.
      const userId = roleNameOrUserId;
      Object.values(RoleService.Roles).forEach((role) => {
        // Revoking all configured roles for the user.
        if (this.getActiveUserRoles(userId).includes(role)) {
          this.revokeRole(userId, role);
        }
      });

      const allEntityIds = new Set(
        this.#entityAccessRoleRecords.map((record) => record.entityId)
      );
      allEntityIds.forEach((entityId) => {
        // Revoking user's access to all entities where user's role is active.
        Object.values(RoleService.Roles).forEach((role) => {
          if (this.getActiveEntityAccessRoles(entityId).includes(role)) {
            this.removeEntityAccessRole(entityId, role);
          }
        });
      });
    }
  }

  // ========================
  // Utility Methods
  // ========================

  /**
   * Retrieves the active roles assigned to a specific user.
   *
   * @param {string} userId - The ID of the user.
   */
  getActiveUserRoles(userId) {
    const userRoles = this.#userRoleRecords
      .filter((record) => record.userId === userId)
      .reduce((roles, record) => {
        roles[record.role] = record.status; // Overwrite with most recent status.
        return roles;
      }, {});

    return Object.entries(userRoles)
      .filter(([role, status]) => status === "active")
      .map(([role]) => role);
  }

  /**
   * Retrieves the active roles assigned to access a specific entity.
   *
   * @param {string} entityId - The ID of the entity.
   */
  getActiveEntityAccessRoles(entityId) {
    const entityRoles = this.#entityAccessRoleRecords
      .filter((record) => record.entityId === entityId)
      .reduce((roles, record) => {
        roles[record.role] = record.status; // Overwrite with most recent status.
        return roles;
      }, {});

    return Object.entries(entityRoles)
      .filter(([role, status]) => status === "active")
      .map(([role]) => role);
  }

  // ========================
  // Access Check Methods
  // ========================

  /**
   * Checks whether a user has access to an entity.
   * @param {string} userId - The ID of the user.
   * @param {string} entityId - The ID of the entity.
   * @returns {boolean} Returns true if the user has access, otherwise false.
   */
  checkAccess(userId, entityId) {
    // Collect the user's active roles.
    const userRoles = this.getActiveUserRoles(userId);
    userRoles.push(userId);

    // If baseRole is set and user doesn't have it as an active role, return false.
    if (this.#baseAccessRole && !userRoles.includes(this.#baseAccessRole))
      return false;

    // Collect the entity's active roles.
    const entityRoles = this.getActiveEntityAccessRoles(entityId);

    // If the entity has no roles associated, everyone can access it.
    if (!Object.keys(entityRoles).length) return true;

    // Check if the user has any active role that is also an active role for the entity.
    return entityRoles.some((role) => userRoles.includes(role));
  }
}

module.exports = RoleService;
