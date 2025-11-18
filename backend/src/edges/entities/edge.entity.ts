import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Rock } from '../../rocks/entities/rock.entity';

@Entity('edges')
@Index(['rock_id'])
@Index(['updated_at'])
export class Edge {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 36 })
  rock_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @Column({ type: 'json', nullable: true })
  version_vector: Record<string, number>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Rock, (rock) => rock.edges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rock_id' })
  rock: Rock;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
