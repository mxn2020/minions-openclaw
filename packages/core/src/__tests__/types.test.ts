import { describe, it, expect } from 'vitest';
import {
    openclawInstanceType,
    openclawSnapshotType,
    openclawAgentType,
    openclawChannelType,
    openclawModelProviderType,
    allOpenClawTypes,
    registry,
} from '../types.js';

describe('OpenClaw Types', () => {
    it('should define all required type metadata', () => {
        for (const type of allOpenClawTypes) {
            expect(type.id).toBeDefined();
            expect(type.name).toBeTruthy();
            expect(type.slug).toBeTruthy();
            expect(type.description).toBeTruthy();
            expect(type.icon).toBeTruthy();
            expect(type.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(type.schema).toBeDefined();
            expect(Array.isArray(type.schema)).toBe(true);
        }
    });

    it('should register all 18 types in the registry', () => {
        expect(allOpenClawTypes).toHaveLength(18);
    });

    it('should have unique IDs for each type', () => {
        const ids = allOpenClawTypes.map(t => t.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique slugs for each type', () => {
        const slugs = allOpenClawTypes.map(t => t.slug);
        const uniqueSlugs = new Set(slugs);
        expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it('should define required url field on instance type', () => {
        const urlField = openclawInstanceType.schema.find(f => f.name === 'url');
        expect(urlField).toBeDefined();
        expect(urlField!.required).toBe(true);
        expect(urlField!.type).toBe('string');
    });

    it('should define required instanceId field on snapshot type', () => {
        const instanceIdField = openclawSnapshotType.schema.find(f => f.name === 'instanceId');
        expect(instanceIdField).toBeDefined();
        expect(instanceIdField!.required).toBe(true);
    });

    it('should define required name and model fields on agent type', () => {
        const nameField = openclawAgentType.schema.find(f => f.name === 'name');
        const modelField = openclawAgentType.schema.find(f => f.name === 'model');
        expect(nameField!.required).toBe(true);
        expect(modelField!.required).toBe(true);
    });

    it('should define required type and name fields on channel type', () => {
        const typeField = openclawChannelType.schema.find(f => f.name === 'type');
        const nameField = openclawChannelType.schema.find(f => f.name === 'name');
        expect(typeField!.required).toBe(true);
        expect(nameField!.required).toBe(true);
    });

    it('should define required provider and model fields on model provider type', () => {
        const providerField = openclawModelProviderType.schema.find(f => f.name === 'provider');
        const modelField = openclawModelProviderType.schema.find(f => f.name === 'model');
        expect(providerField!.required).toBe(true);
        expect(modelField!.required).toBe(true);
    });
});
