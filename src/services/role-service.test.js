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
    const entityId = "entityId";
    const entity2Id = "entity2Id";

    roleService.grantRole(userId, role);
    roleService.setEntityAccessRole(entityId, role);
    roleService.setEntityAccessRole(entity2Id, userId);

    roleService.removeRole(userId); // Here we're using userId instead of roleName

    // Check if the role has been revoked for the user
    const userRoles = roleService.getActiveUserRoles(userId);
    expect(userRoles).not.toContain(role);

    // Check if the role has been revoked for the entity
    const entityRoles = roleService.getActiveEntityAccessRoles(entity2Id);
    expect(entityRoles).not.toContain(userId);
  });

  test("should not revoke role from user if user does not have the role", () => {
    const roleName = "AdminRole";
    const roleKey = "admin";
    const userId = "userId";

    // Creating a role
    roleService.createRole(roleName, roleKey);

    // Assign a different role
    roleService.grantRole(userId, RoleService.Roles.Editor);

    // Setup a spy on revokeRole method
    const revokeRoleSpy = jest.spyOn(roleService, "revokeRole");

    // Trying to remove role that the user does not have
    roleService.removeRole(roleName);

    // revokeRole should not have been called
    expect(revokeRoleSpy).not.toHaveBeenCalled();

    // User should only have their other role
    expect(roleService.getActiveUserRoles(userId)).toEqual([
      RoleService.Roles.Editor,
    ]);
  });

  test("should not remove access role from entity if entity does not have the role", () => {
    const roleName = "AdminRole";
    const roleKey = "admin";
    const entityId = "entityId";

    // Creating a role
    roleService.createRole(roleName, roleKey);

    // Assign a different role
    roleService.setEntityAccessRole(entityId, RoleService.Roles.Editor);

    // Setup a spy on revokeRole method
    const removeEntityAccessRoleSpy = jest.spyOn(
      roleService,
      "removeEntityAccessRole"
    );

    // Trying to remove role that the entity does not have
    roleService.removeRole(roleName);

    // revokeRole should not have been called
    expect(removeEntityAccessRoleSpy).not.toHaveBeenCalled();

    // Entity should only have it's other access role
    expect(roleService.getActiveEntityAccessRoles(entityId)).toEqual([
      RoleService.Roles.Editor,
    ]);
  });
});
