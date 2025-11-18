import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
export class User {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password_hash: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  username: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_sync_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
