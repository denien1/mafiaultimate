
import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { DbService } from './db.service';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class Job {
  @Field(() => Int) id: number;
  @Field() name: string;
  @Field(() => Int) tier: number;
  @Field(() => Int) energy_cost: number;
  @Field(() => Int) reward_xp: number;
  @Field(() => Int) reward_cash: number;
}

@ObjectType()
class RunResult {
  @Field() ok: boolean;
  @Field(() => Int) reward_xp: number;
  @Field(() => Int) reward_cash: number;
}

@Resolver()
export class GqlResolver {
  constructor(private db: DbService) {}

  @Query(() => [Job])
  async jobs() {
    const { rows } = await this.db.query('SELECT * FROM jobs ORDER BY id');
    return rows;
  }

  @Mutation(() => RunResult)
  async runJob(@Args('userId') userId: string, @Args('jobId') jobId: number) {
    const job = (await this.db.query('SELECT * FROM jobs WHERE id=$1',[jobId])).rows[0];
    if (!job) throw new Error('no-such-job');
    const sres = await this.db.query('SELECT energy FROM stats WHERE user_id=$1',[userId]);
    const energy = sres.rows[0]?.energy ?? 0;
    if (energy < job.energy_cost) throw new Error('not-enough-energy');
    await this.db.query('UPDATE stats SET energy=energy-$1 WHERE user_id=$2',[job.energy_cost,userId]);
    await this.db.query('UPDATE profiles SET xp=xp+$1, cash=cash+$2 WHERE user_id=$3',[job.reward_xp, job.reward_cash, userId]);
    return { ok: true, reward_xp: job.reward_xp, reward_cash: job.reward_cash };
  }
}
