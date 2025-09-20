import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Settings extends Document {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: String, enum: ['dark', 'light'], default: 'light' })
  theme: string;

  @Prop({
    type: { email: Boolean, push: Boolean },
    default: { email: true, push: false },
  })
  notifications: { email: boolean; push: boolean };

  @Prop({ type: String, default: 'es' })
  language: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
