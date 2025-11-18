import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';

export enum RockStatus {
  ACTIVE = 'active',
  GEM = 'gem',
  ARCHIVED = 'archived',
}

@Entity('rocks')
@Index(['user_id', 'status'])
@Index(['updated_at'])
export class Rock {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RockStatus,
    default: RockStatus.ACTIVE,
  })
  status: RockStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  progress: number;

  @Column({ type: 'json', nullable: true })
  version_vector: Record<string, number>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  archived_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany('Edge', 'rock')
  edges: any[];

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
