import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  agentId!: string; // e.g., transform-army-ai.recon.scout

  @Column()
  name!: string;

  @Column({ type: 'jsonb', nullable: true })
  manifest?: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


