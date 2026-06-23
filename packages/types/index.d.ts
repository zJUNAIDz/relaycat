import { z } from "zod/v3";
export type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
};
export type ProfileLink = {
    label: string;
    url: string;
};
export type Profile = {
    id: string;
    userId: string;
    displayName: string | null;
    bio: string | null;
    avatar: string | null;
    banner: string | null;
    accentColor: string | null;
    pronouns: string | null;
    status: string | null;
    links: ProfileLink[];
    createdAt: Date;
    updatedAt: Date;
};
export type ProfileWithUser = Profile & {
    user: User;
};
export declare const MemberRole: {
    readonly ADMIN: "ADMIN";
    readonly MODERATOR: "MODERATOR";
    readonly GUEST: "GUEST";
};
export type MemberRole = keyof typeof MemberRole;
export declare const ChannelType: {
    readonly TEXT: "TEXT";
    readonly AUDIO: "AUDIO";
    readonly VIDEO: "VIDEO";
};
export type ChannelType = keyof typeof ChannelType;
export type Server = {
    id: string;
    name: string;
    image: string | null;
    inviteCode: string;
    banner: string | null;
    description: string | null;
    memberCount: number;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date | null;
};
export type Member = {
    id: string;
    role: MemberRole;
    userId: string;
    serverId: string;
    createdAt: Date;
    updatedAt: Date | null;
    user: User;
    server: Server;
};
export type Channel = {
    id: string;
    name: string;
    type: ChannelType;
    serverId: string;
    createdAt: Date;
    updatedAt: Date | null;
    user: User;
    server: Server;
    Message: Message[];
};
export type Message = {
    id: string;
    content: string | null;
    fileUrl: string | null;
    deleted: boolean;
    memberId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date | null;
    member: Member;
    channel: Channel;
};
export type ServerWithMembersAndUser = Server & {
    members: (Member & {
        user: User;
    })[];
};
export type ServerWithMembersUserAndChannels = Server & {
    members: (Member & {
        user: User;
    })[];
    channels: Channel[];
};
export type ServerWithMembersOnly = Server & {
    members: Member[];
};
export type ServerWithChannels = Server & {
    channels: Channel[];
};
export declare const UserAuthStatus: {
    readonly AUTHENTICATED: "AUTHENTICATED";
    readonly UNAUTHENTICATED: "UNAUTHENTICATED";
    readonly NOTFOUND: "NOTFOUND";
    readonly DELETED: "DELETED";
    readonly ERROR: "ERROR";
};
export type UserAuthStatusType = keyof typeof UserAuthStatus;
export type UserProfileResponse = {
    profile: User | null;
    status: UserAuthStatusType;
};
export declare const CreateServerResponseStatus: {
    readonly SUCCESS: "SUCCESS";
    readonly FAILED: "FAILED";
    readonly ERROR: "ERROR";
};
export type CreateServerResponseStatusType = keyof typeof CreateServerResponseStatus;
export interface CreateServerResponse {
    server: Server | null;
    status: CreateServerResponseStatusType;
}
export type MessageWithMemberWithUser = {
    message: Message;
    member: Member;
    user: User & {
        image: string | null;
    };
};
export type MemberWithUser = Member & {
    user: User;
};
export declare const CreateServerDTO: z.ZodObject<{
    name: z.ZodString;
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    image?: string | null | undefined;
}, {
    name: string;
    image?: string | null | undefined;
}>;
export type CreateServerInput = z.infer<typeof CreateServerDTO>;
export declare const EditServerDTO: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    image?: string | null | undefined;
}, {
    name?: string | undefined;
    image?: string | null | undefined;
}>;
export type EditServerInput = z.infer<typeof EditServerDTO>;
export declare const CreateChannelDTO: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, string>;
    type: z.ZodEnum<["TEXT", "AUDIO", "VIDEO"]>;
    serverId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "TEXT" | "AUDIO" | "VIDEO";
    serverId: string;
}, {
    name: string;
    type: "TEXT" | "AUDIO" | "VIDEO";
    serverId: string;
}>;
export type CreateChannelInput = z.infer<typeof CreateChannelDTO>;
export declare const EditChannelDTO: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export type EditChannelInput = z.infer<typeof EditChannelDTO>;
export declare const ChangeMemberRoleDTO: z.ZodObject<{
    role: z.ZodEnum<["ADMIN", "MODERATOR", "MEMBER"]>;
    memberId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    role: "ADMIN" | "MODERATOR" | "MEMBER";
    memberId: string;
}, {
    role: "ADMIN" | "MODERATOR" | "MEMBER";
    memberId: string;
}>;
export type ChangeMemberRoleInput = z.infer<typeof ChangeMemberRoleDTO>;
export declare const CreateMessageDTO: z.ZodEffects<z.ZodObject<{
    content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fileUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    content?: string | null | undefined;
    fileUrl?: string | null | undefined;
}, {
    content?: string | null | undefined;
    fileUrl?: string | null | undefined;
}>, {
    content?: string | null | undefined;
    fileUrl?: string | null | undefined;
}, {
    content?: string | null | undefined;
    fileUrl?: string | null | undefined;
}>;
export type CreateMessageInput = z.infer<typeof CreateMessageDTO>;
export declare const EditMessageDTO: z.ZodObject<{
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content: string;
}, {
    content: string;
}>;
export type EditMessageInput = z.infer<typeof EditMessageDTO>;
export declare const ProfileLinkDTO: z.ZodObject<{
    label: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    label: string;
    url: string;
}, {
    label: string;
    url: string;
}>;
export declare const UpdateProfileDTO: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    avatar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    banner: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    accentColor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pronouns: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    links: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        label: string;
        url: string;
    }, {
        label: string;
        url: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: string | null | undefined;
    displayName?: string | null | undefined;
    bio?: string | null | undefined;
    avatar?: string | null | undefined;
    banner?: string | null | undefined;
    accentColor?: string | null | undefined;
    pronouns?: string | null | undefined;
    links?: {
        label: string;
        url: string;
    }[] | undefined;
}, {
    status?: string | null | undefined;
    displayName?: string | null | undefined;
    bio?: string | null | undefined;
    avatar?: string | null | undefined;
    banner?: string | null | undefined;
    accentColor?: string | null | undefined;
    pronouns?: string | null | undefined;
    links?: {
        label: string;
        url: string;
    }[] | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileDTO>;
//# sourceMappingURL=index.d.ts.map