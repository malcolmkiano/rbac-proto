// @ts-check

const RoleService = require("./role-service");

describe("RoleService", () => {
  /** @type {RoleService} */
  let roleService;

  beforeEach(() => {
    roleService = new RoleService([], []);
  });

  test("should create a new role", () => {
    const roleName = "TestRole";
    const roleKey = "test";

    roleService.createRole(roleName, roleKey);

    // Check if the role has been created
    expect(RoleService.Roles[roleName]).toBe(roleKey);
  });

  test("should remove a role by name and revoke access", () => {
    const roleName = "TestRole";
    const roleId = "test";
    const userId = "userId";
    const entityId = "entityId";

    roleService.createRole(roleName, roleId);

    // Grant the role to a user and set it for an entity
    roleService.grantRole(userId, roleId);
    roleService.setEntityAccessRole(entityId, roleId);

    // Remove the role
    roleService.removeRole(roleName);

    // Check if the role has been removed
    expect(RoleService.Roles[roleName]).toBeUndefined();

    // Check if the role has been revoked for the user
    const userRoles = roleService.getActiveUserRoles(userId);
    expect(userRoles).not.toContain(roleId);

    // Check if the role has been revoked for the entity
    const entityRoles = roleService.getActiveEntityAccessRoles(entityId);
    expect(entityRoles).not.toContain(roleId);
  });

  test("should set and remove the base role", () => {
    const baseRole = RoleService.Roles.Editor;
    const testUser1 = "testUser1";
    const testUser2 = "testUser2";
    const entityId = "dummyEntityId";

    roleService.grantRole(testUser1, baseRole);

    roleService.setBaseAccessRole(baseRole);
    expect(roleService.checkAccess(testUser1, entityId)).toBe(true);
    expect(roleService.checkAccess(testUser2, entityId)).toBe(false);

    roleService.removeBaseAccessRole();
    expect(roleService.checkAccess(testUser2, entityId)).toBe(true);
  });

  test("should grant and revoke role for a user", () => {
    const userId = "user1";
    const role = RoleService.Roles.Editor;

    roleService.grantRole(userId, role);
    expect(roleService.getActiveUserRoles(userId)).toContain(role);

    roleService.revokeRole(userId, role);
    expect(roleService.getActiveUserRoles(userId)).not.toContain(role);
  });

  test("should set and remove access role for an entity", () => {
    const entityId = "entity1";
    const role = RoleService.Roles.Editor;

    roleService.setEntityAccessRole(entityId, role);
    expect(roleService.getActiveEntityAccessRoles(entityId)).toContain(role);

    roleService.removeEntityAccessRole(entityId, role);
    expect(roleService.getActiveEntityAccessRoles(entityId)).not.toContain(
      role
    );
  });

  test("should check if user has access to an entity", () => {
    const userId = "user1";
    const entityId = "entity1";
    const role = RoleService.Roles.Editor;

    roleService.grantRole(userId, role);
    roleService.setEntityAccessRole(entityId, role);
    expect(roleService.checkAccess(userId, entityId)).toBe(true);

    roleService.revokeRole(userId, role);
    expect(roleService.checkAccess(userId, entityId)).toBe(false);
  });

  test("should remove role by userId and revoke access", () => {
    const userId = "userToRemove";
    const role = RoleService.Roles.Editor;

    roleService.grantRole(userId, role);
    roleService.setEntityAccessRole("entityId", role);

    roleService.removeRole(userId); // Here we're using userId instead of roleName

    // Check if the role has been revoked for the user
    const userRoles = roleService.getActiveUserRoles(userId);
    expect(userRoles).not.toContain(role);

    // Check if the role has been revoked for the entity
    const entityRoles = roleService.getActiveEntityAccessRoles("entityId");
    expect(entityRoles).not.toContain(role);
  });
});
