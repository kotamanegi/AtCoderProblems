import * as request from "superagent";
import { Problem } from "../model/Problem";
import { Contest } from "../model/Contest";
import { Submission } from "../model/Submission";
import { RankPair } from "../model/RankPair";
import { MergedProblem } from "../model/MergedProblem";
import { LangCount } from "../model/LangCount";
import { PredictedRating } from "../model/PredictedRating";
import { UserInfo } from "../model/UserInfo";

export class ApiCall {
  static BaseUrl = "./atcoder-api";
  static ResourceUrl = "./resources";

  static getJson(url: string, query?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .query(query)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res.body);
          }
        });
    });
  }

  static async getUserInfo(userId: string): Promise<UserInfo> {
    let url = `${this.BaseUrl}/v2/user_info?user=${userId}`;
    const obj = await this.getJson(url);
    return (obj as UserInfo);
  }

  static async getProblems(): Promise<Array<Problem>> {
    let url = `${this.ResourceUrl}/problems.json`;
    const obj = await this.getJson(url);
    let problems: Problem[] = obj.map((o: Problem) => o as Problem);
    return problems;
  }

  static async getPredictedRatings(): Promise<Array<PredictedRating>> {
    let url = `${this.BaseUrl}/info/predicted-ratings`;
    const obj = await this.getJson(url);
    let predictedRatings: PredictedRating[] = obj.map((o: PredictedRating) => o as PredictedRating);
    return predictedRatings;
  }

  static async getRanking(kind: string): Promise<Array<RankPair>> {
    let url = `${this.ResourceUrl}/${kind}.json`;
    const obj = await this.getJson(url);
    let ranks = obj.map((o: { [x: string]: any; }) => {
      let p = { rank: 1, user_id: o["user_id"], count: o["problem_count"] };
      return p;
    });
    return this.fixRanking(ranks);
  }

  static async getRatedPointSumRanking(): Promise<Array<RankPair>> {
    let url = `${this.ResourceUrl}/sums.json`;
    const obj = await this.getJson(url);
    let ranks = obj.map((o: { [x: string]: any; }) => {
      let p = { rank: 1, user_id: o["user_id"], count: o["point_sum"] };
      return p;
    });
    return this.fixRanking(ranks);
  }

  static fixRanking(ranks: Array<RankPair>): Array<RankPair> {
    ranks.sort((a, b) => b.count - a.count);

    for (let i = 1; i < ranks.length; i += 1) {
      if (ranks[i - 1].count == ranks[i].count) {
        ranks[i].rank = ranks[i - 1].rank;
      } else {
        ranks[i].rank = i + 1;
      }
    }

    return ranks;
  }

  static async getContests(): Promise<Array<Contest>> {
    let url = `${this.ResourceUrl}/contests.json`;
    const obj = await this.getJson(url);
    let contests: Contest[] = obj.map((o: { id: string, title: string, start_epoch_second: number, rate_change: string }) => new Contest(o.id, o.title, o.start_epoch_second, o.rate_change));
    return contests;
  }

  static async getSubmissions(user: string): Promise<Array<Submission>> {
    let url = `${this.BaseUrl}/results`;
    let query = { user: user };
    const obj = await this.getJson(url, query);
    let submissions: Submission[] = obj.map((o: Submission) => o as Submission);
    return submissions;
  }

  static async getMergedProblems(): Promise<Array<MergedProblem>> {
    let url = `${this.ResourceUrl}/merged-problems.json`;
    const obj = await this.getJson(url);
    let problems: MergedProblem[] = obj.map((o: MergedProblem) => o as MergedProblem);
    return problems;
  }

  static async getLanguageCounts(): Promise<Array<LangCount>> {
    let url = `${this.ResourceUrl}/lang.json`;
    const obj = await this.getJson(url);
    let counts: LangCount[] = obj.map((o: LangCount) => o as LangCount);
    return counts;
  }
}
