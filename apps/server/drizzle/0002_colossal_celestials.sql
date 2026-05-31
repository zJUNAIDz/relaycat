CREATE INDEX "attachments_message_id_idx" ON "attachments" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "channels_server_id_idx" ON "channels" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "members_user_id_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "members_server_id_idx" ON "members" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "messages_member_id_idx" ON "messages" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "messages_channel_id_idx" ON "messages" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "servers_invite_code_idx" ON "servers" USING btree ("invite_code");