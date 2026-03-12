export class ScoreManager {
  playerScore = 0;
  opponentScore = 0;

  playerGoal(): void {
    this.playerScore++;
  }

  opponentGoal(): void {
    this.opponentScore++;
  }

  reset(): void {
    this.playerScore = 0;
    this.opponentScore = 0;
  }

  toString(): string {
    return `${this.playerScore} - ${this.opponentScore}`;
  }
}
