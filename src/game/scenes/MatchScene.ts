import Phaser from 'phaser';
import {
  PITCH_WIDTH,
  PITCH_HEIGHT,
  PITCH_MARGIN_X,
  PITCH_MARGIN_Y,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  PLAYER_ACCELERATION,
  PLAYER_DECELERATION,
  STAMINA_MAX,
  STAMINA_DRAIN_PER_SEC,
  STAMINA_RECOVERY_PER_SEC,
  SPRINT_SPEED_MULT,
  EXHAUSTED_SPEED_MULT,
  STAMINA_EXHAUSTED_THRESHOLD,
  DRIBBLE_SPEED_MULT,
  DRIBBLE_BALL_OFFSET,
  BALL_RADIUS,
  POSSESSION_DISTANCE,
  PASS_SPEED,
  PASS_SPEED_LONG,
  SHOOT_SPEED,
  SHOOT_SPEED_MAX_CHARGED,
  SHOOT_CHARGE_TIME_MS,
  FINESSE_SPEED_MULT,
  BALL_GROUND_DRAG,
  BALL_BOUNCE_DAMP,
  BALL_SPIN_CURVE_STRENGTH,
  OPPONENT_SPEED,
  OPPONENT_PRESS_DIST,
  TACKLE_RANGE,
  TACKLE_COOLDOWN_MS,
  FOUL_PROBABILITY,
  GOAL_TOP,
  GOAL_BOTTOM,
  GOAL_LINE_OFFSET,
  HALF_DURATION_SEC,
  STOPPAGE_TIME_MIN,
  STOPPAGE_TIME_MAX,
  KEEPER_SAVE_RADIUS,
  KEEPER_DIFFICULTY_MEDIUM,
TEAM_SIZE,
  SET_PIECE_AIM_SPEED,
  SET_PIECE_POWER_MAX,
  REPLAY_SNAPSHOT_INTERVAL_MS,
  REPLAY_PLAYBACK_MS,
  REPLAY_RECORD_SEC,
} from '../config/constants';
import { formationToWorldPositions } from '../config/formations';

type SetPieceType = 'throw-in' | 'goal-kick' | 'corner' | null;

interface ReplaySnapshot {
  ball: { x: number; y: number };
  players: { x: number; y: number }[];
  opponents: { x: number; y: number }[];
  keeperPlayer: { x: number; y: number };
  keeperOpponent: { x: number; y: number };
}

interface OutfieldPlayer {
  sprite: Phaser.Physics.Arcade.Image;
  role: 'def' | 'mid' | 'att';
  homeX: number;
  homeY: number;
  stamina: number;
  control: number;
  speed: number;
  isHuman: boolean;
}

export class MatchScene extends Phaser.Scene {
  private players: OutfieldPlayer[] = [];
  private opponents: OutfieldPlayer[] = [];
  private keeperPlayer!: Phaser.Physics.Arcade.Image;
  private keeperOpponent!: Phaser.Physics.Arcade.Image;
  private ball!: Phaser.Physics.Arcade.Image;
  private ballSpin = 0;
  private selectedIndex = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private passKey!: Phaser.Input.Keyboard.Key;
  private longPassKey!: Phaser.Input.Keyboard.Key;
  private shootKey!: Phaser.Input.Keyboard.Key;
  private sprintKey!: Phaser.Input.Keyboard.Key;
  private dribbleKey!: Phaser.Input.Keyboard.Key;
  private tackleKey!: Phaser.Input.Keyboard.Key;
  private switchKey!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private facingX = 0;
  private facingY = 1;
  private scorePlayer = 0;
  private scoreOpponent = 0;
  private timeRemaining = 0;
  private half = 1;
  private stoppageTime = 0;
  private hudText!: Phaser.GameObjects.Text;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private matchEnded = false;
  private halfTimeActive = false;
  private halfTimeEndAt = 0;
  private setPieceType: SetPieceType = null;
  private setPieceAim = 0;
  private setPiecePower = 0.5;
  private setPieceForTeam: 'player' | 'opponent' | null = null;
  private lastTackleTime = 0;
  private shootChargeStart = 0;
  private keeperDiffMult = KEEPER_DIFFICULTY_MEDIUM;
  private formationKey = '2-1-2';

  private replayBuffer: ReplaySnapshot[] = [];
  private lastReplayRecordTime = 0;
  private replayMode = false;
  private replayStartTime = 0;
  private replaySnapshots: ReplaySnapshot[] = [];
  private lastReplayScorer: 'player' | 'opponent' | null = null;
  private goalOverlayText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Match' });
  }

  create(): void {
    this.scorePlayer = 0;
    this.scoreOpponent = 0;
    this.half = 1;
    this.timeRemaining = HALF_DURATION_SEC;
    this.stoppageTime = 0;
    this.matchEnded = false;
    this.halfTimeActive = false;
    this.setPieceType = null;
    this.selectedIndex = 0;
    this.ballSpin = 0;
    this.shootChargeStart = 0;
    this.lastTackleTime = 0;
    this.keeperDiffMult = KEEPER_DIFFICULTY_MEDIUM;
    this.replayBuffer = [];
    this.lastReplayRecordTime = 0;
    this.replayMode = false;

    this.drawPitch();
    this.createPlayerTexture();
    this.createBallTexture();
    this.createTeams();
    this.createKeepers();
    this.createBall();
    this.setupInput();
    this.hudText = this.add
      .text(400, 18, '', { fontSize: '18px', color: '#fff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.staminaBar = this.add.graphics().setScrollFactor(0);
    this.goalOverlayText = this.add
      .text(400, 280, '', { fontSize: '42px', color: '#fff', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);
    this.refreshHud();
  }

  private createPlayerTexture(): void {
    const size = PLAYER_RADIUS * 2 + 4;
    const g = this.make.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(PLAYER_RADIUS + 2, PLAYER_RADIUS + 2, PLAYER_RADIUS);
    g.generateTexture('player', size, size);
    g.destroy();
  }

  private createBallTexture(): void {
    const size = BALL_RADIUS * 2 + 4;
    const g = this.make.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(BALL_RADIUS + 2, BALL_RADIUS + 2, BALL_RADIUS);
    g.generateTexture('ball', size, size);
    g.destroy();
  }

  private drawPitch(): void {
    const g = this.add.graphics();
    g.fillStyle(0x2d5a27, 1);
    g.fillRect(PITCH_MARGIN_X, PITCH_MARGIN_Y, PITCH_WIDTH, PITCH_HEIGHT);
    g.lineStyle(2, 0xffffff, 1);
    g.strokeRect(PITCH_MARGIN_X, PITCH_MARGIN_Y, PITCH_WIDTH, PITCH_HEIGHT);
    g.lineBetween(400, PITCH_MARGIN_Y, 400, PITCH_MARGIN_Y + PITCH_HEIGHT);
    this.add.circle(400, 300, 50).setStrokeStyle(2, 0xffffff).setFillStyle(0x2d5a27);
    g.strokeRect(PITCH_MARGIN_X, GOAL_TOP, 4, GOAL_BOTTOM - GOAL_TOP);
    g.strokeRect(PITCH_MARGIN_X + PITCH_WIDTH - 4, GOAL_TOP, 4, GOAL_BOTTOM - GOAL_TOP);
  }

  private createTeams(): void {
    this.players = [];
    this.opponents = [];
    const playerPos = formationToWorldPositions(this.formationKey, true);
    const oppPos = formationToWorldPositions(this.formationKey, false);
    for (let i = 0; i < TEAM_SIZE; i++) {
      const p = this.physics.add.image(playerPos[i].x, playerPos[i].y, 'player');
      p.setCircle(PLAYER_RADIUS);
      p.setTint(0x0066ff);
      p.setCollideWorldBounds(false);
      p.setMaxVelocity(PLAYER_SPEED * 1.2);
      p.setDrag(PLAYER_DECELERATION);
      this.players.push({
        sprite: p,
        role: playerPos[i].role,
        homeX: playerPos[i].x,
        homeY: playerPos[i].y,
        stamina: STAMINA_MAX,
        control: 0.75 + Math.random() * 0.2,
        speed: PLAYER_SPEED,
        isHuman: i === 0,
      });
      const o = this.physics.add.image(oppPos[i].x, oppPos[i].y, 'player');
      o.setCircle(PLAYER_RADIUS);
      o.setTint(0xcc2222);
      o.setCollideWorldBounds(false);
      o.setMaxVelocity(OPPONENT_SPEED * 1.2);
      o.setDrag(300);
      this.opponents.push({
        sprite: o,
        role: oppPos[i].role,
        homeX: oppPos[i].x,
        homeY: oppPos[i].y,
        stamina: STAMINA_MAX,
        control: 0.7,
        speed: OPPONENT_SPEED,
        isHuman: false,
      });
    }
  }

  private createKeepers(): void {
    const gkY = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.keeperPlayer = this.physics.add.image(PITCH_MARGIN_X + 30, gkY, 'player');
    this.keeperPlayer.setCircle(PLAYER_RADIUS);
    this.keeperPlayer.setTint(0x0044aa);
    this.keeperPlayer.setCollideWorldBounds(false);
    this.keeperOpponent = this.physics.add.image(PITCH_MARGIN_X + PITCH_WIDTH - 30, gkY, 'player');
    this.keeperOpponent.setCircle(PLAYER_RADIUS);
    this.keeperOpponent.setTint(0xaa2222);
    this.keeperOpponent.setCollideWorldBounds(false);
  }

  private createBall(): void {
    this.ball = this.physics.add.image(
      PITCH_MARGIN_X + PITCH_WIDTH / 2,
      PITCH_MARGIN_Y + PITCH_HEIGHT / 2,
      'ball'
    );
    this.ball.setCircle(BALL_RADIUS);
    this.ball.setTint(0xf5d742);
    this.ball.setCollideWorldBounds(false);
    this.ball.setBounce(BALL_BOUNCE_DAMP);
    this.ball.setDrag(BALL_GROUND_DRAG);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.passKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.longPassKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.shootKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.sprintKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.dribbleKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.tackleKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.switchKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  private get selectedPlayer(): OutfieldPlayer {
    return this.players[this.selectedIndex];
  }

  private hasPossession(): boolean {
    const p = this.selectedPlayer.sprite;
    const dist = Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y);
    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    return dist <= POSSESSION_DISTANCE && speed < 25;
  }

  private whoHasPossession(): 'player' | 'opponent' | null {
    for (const o of this.opponents) {
      const dist = Phaser.Math.Distance.Between(o.sprite.x, o.sprite.y, this.ball.x, this.ball.y);
      const body = this.ball.body as Phaser.Physics.Arcade.Body;
      const speed = Math.hypot(body.velocity.x, body.velocity.y);
      if (dist <= POSSESSION_DISTANCE && speed < 25) return 'opponent';
    }
    if (this.hasPossession()) return 'player';
    return null;
  }

  update(_time: number, delta: number): void {
    if (this.matchEnded) {
      if (Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.restart();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    if (this.replayMode) {
      this.updateReplay(delta);
      return;
    }
    if (this.halfTimeActive) {
      this.hudText.setText(`HALF TIME — Score ${this.scorePlayer}-${this.scoreOpponent} — Press X or wait 3s for 2nd half`);
      this.updateHalfTime(delta);
      return;
    }
    if (this.setPieceType) {
      this.updateSetPiece(delta);
      return;
    }

    this.timeRemaining -= delta / 1000;
    if (this.timeRemaining <= 0) {
      this.stoppageTime = Phaser.Math.Between(STOPPAGE_TIME_MIN, STOPPAGE_TIME_MAX);
      if (this.stoppageTime > 0) {
        this.timeRemaining = this.stoppageTime;
        this.stoppageTime = 0;
      } else {
        if (this.half === 1) {
          this.half = 2;
          this.halfTimeActive = true;
          this.halfTimeEndAt = Date.now() + 3000;
          this.timeRemaining = HALF_DURATION_SEC;
          return;
        } else {
          this.timeRemaining = 0;
          this.matchEnded = true;
          this.refreshHud();
          return;
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.switchKey)) {
      this.selectedIndex = (this.selectedIndex + 1) % TEAM_SIZE;
    }

    this.checkGoals();
    this.checkOutOfPlay();
    this.updateStamina(delta);
    this.updatePlayerMovement(delta);
    this.updateTackle(delta);
    this.updateBallPossessionAndFirstTouch(delta);
    this.updateBallPhysics(delta);
    this.updateKeeperAI(delta);
    this.updateTeammateAI(delta);
    this.updateOpponentAI(delta);
    this.updatePassAndShoot(delta);
    this.clampAllToPitch();
    this.recordReplaySnapshot();
    this.refreshHud();
  }

  private recordReplaySnapshot(): void {
    const now = Date.now();
    if (now - this.lastReplayRecordTime < REPLAY_SNAPSHOT_INTERVAL_MS) return;
    this.lastReplayRecordTime = now;
    const snap: ReplaySnapshot = {
      ball: { x: this.ball.x, y: this.ball.y },
      players: this.players.map((p) => ({ x: p.sprite.x, y: p.sprite.y })),
      opponents: this.opponents.map((o) => ({ x: o.sprite.x, y: o.sprite.y })),
      keeperPlayer: { x: this.keeperPlayer.x, y: this.keeperPlayer.y },
      keeperOpponent: { x: this.keeperOpponent.x, y: this.keeperOpponent.y },
    };
    this.replayBuffer.push(snap);
    const maxFrames = (REPLAY_RECORD_SEC * 1000) / REPLAY_SNAPSHOT_INTERVAL_MS;
    if (this.replayBuffer.length > maxFrames) this.replayBuffer.shift();
  }

  private updateReplay(_delta: number): void {
    const elapsed = Date.now() - this.replayStartTime;
    if (elapsed >= REPLAY_PLAYBACK_MS || Phaser.Input.Keyboard.JustDown(this.passKey)) {
      this.goalOverlayText.setVisible(false);
      this.replayMode = false;
      this.replaySnapshots = [];
      this.lastReplayScorer = null;
      this.resetPositionsAfterGoal();
      return;
    }
    const t = elapsed / REPLAY_PLAYBACK_MS;
    const frameIndex = t * (this.replaySnapshots.length - 1);
    const i0 = Math.floor(frameIndex);
    const i1 = Math.min(i0 + 1, this.replaySnapshots.length - 1);
    const frac = frameIndex - i0;
    const s0 = this.replaySnapshots[i0];
    const s1 = this.replaySnapshots[i1];
    if (!s0) return;
    this.ball.x = s0.ball.x + (s1 ? (s1.ball.x - s0.ball.x) * frac : 0);
    this.ball.y = s0.ball.y + (s1 ? (s1.ball.y - s0.ball.y) * frac : 0);
    this.ball.setVelocity(0, 0);
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].sprite.x = s0.players[i].x + (s1 ? (s1.players[i].x - s0.players[i].x) * frac : 0);
      this.players[i].sprite.y = s0.players[i].y + (s1 ? (s1.players[i].y - s0.players[i].y) * frac : 0);
      this.players[i].sprite.setVelocity(0, 0);
    }
    for (let i = 0; i < this.opponents.length; i++) {
      this.opponents[i].sprite.x = s0.opponents[i].x + (s1 ? (s1.opponents[i].x - s0.opponents[i].x) * frac : 0);
      this.opponents[i].sprite.y = s0.opponents[i].y + (s1 ? (s1.opponents[i].y - s0.opponents[i].y) * frac : 0);
      this.opponents[i].sprite.setVelocity(0, 0);
    }
    this.keeperPlayer.x = s0.keeperPlayer.x + (s1 ? (s1.keeperPlayer.x - s0.keeperPlayer.x) * frac : 0);
    this.keeperPlayer.y = s0.keeperPlayer.y + (s1 ? (s1.keeperPlayer.y - s0.keeperPlayer.y) * frac : 0);
    this.keeperPlayer.setVelocity(0, 0);
    this.keeperOpponent.x = s0.keeperOpponent.x + (s1 ? (s1.keeperOpponent.x - s0.keeperOpponent.x) * frac : 0);
    this.keeperOpponent.y = s0.keeperOpponent.y + (s1 ? (s1.keeperOpponent.y - s0.keeperOpponent.y) * frac : 0);
    this.keeperOpponent.setVelocity(0, 0);
    const who = this.lastReplayScorer === 'player' ? 'Your goal!' : 'Opponent goal!';
    this.goalOverlayText.setText(`${who}\nReplay — X to skip`);
    this.goalOverlayText.setVisible(true);
  }

  private updateHalfTime(_delta: number): void {
    if (Date.now() < this.halfTimeEndAt && !this.passKey.isDown) return;
    this.halfTimeActive = false;
    this.resetPositionsAfterGoal();
  }

  private updateStamina(delta: number): void {
    const p = this.selectedPlayer;
    const sprinting = this.sprintKey.isDown && (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown);
    if (sprinting && p.stamina > 0) {
      p.stamina = Math.max(0, p.stamina - (STAMINA_DRAIN_PER_SEC * delta) / 1000);
    } else {
      p.stamina = Math.min(STAMINA_MAX, p.stamina + (STAMINA_RECOVERY_PER_SEC * delta) / 1000);
    }
  }

  private updatePlayerMovement(delta: number): void {
    const p = this.selectedPlayer.sprite;
    const body = p.body as Phaser.Physics.Arcade.Body;
    const data = this.selectedPlayer;
    const exhausted = data.stamina < STAMINA_EXHAUSTED_THRESHOLD;
    const sprintMult = this.sprintKey.isDown && !exhausted ? SPRINT_SPEED_MULT : 1;
    const dribbleMult = this.dribbleKey.isDown ? DRIBBLE_SPEED_MULT : 1;
    const speedMult = exhausted ? EXHAUSTED_SPEED_MULT : sprintMult * dribbleMult;
    const maxSpeed = PLAYER_SPEED * speedMult;

    let ax = 0;
    let ay = 0;
    if (this.cursors.left.isDown) {
      ax = -1;
      this.facingX = -1;
      this.facingY = 0;
    } else if (this.cursors.right.isDown) {
      ax = 1;
      this.facingX = 1;
      this.facingY = 0;
    }
    if (this.cursors.up.isDown) {
      ay = -1;
      this.facingX = ax !== 0 ? this.facingX : 0;
      this.facingY = ay;
    } else if (this.cursors.down.isDown) {
      ay = 1;
      this.facingX = ax !== 0 ? this.facingX : 0;
      this.facingY = ay;
    }

    const len = Math.hypot(ax, ay) || 1;
    const targetVx = (ax / len) * maxSpeed;
    const targetVy = (ay / len) * maxSpeed;
    const dv = (PLAYER_ACCELERATION * delta) / 1000;
    let vx = body.velocity.x;
    let vy = body.velocity.y;
    if (ax !== 0 || ay !== 0) {
      vx += (targetVx - vx) * Math.min(1, dv / Math.abs(targetVx - vx) || 1);
      vy += (targetVy - vy) * Math.min(1, dv / Math.abs(targetVy - vy) || 1);
    } else {
      vx *= 1 - (PLAYER_DECELERATION * delta) / 1000 / 400;
      vy *= 1 - (PLAYER_DECELERATION * delta) / 1000 / 400;
    }
    const currentSpeed = Math.hypot(vx, vy);
    if (currentSpeed > maxSpeed) {
      const s = maxSpeed / currentSpeed;
      vx *= s;
      vy *= s;
    }
    body.setVelocity(vx, vy);

    if (this.hasPossession() && this.dribbleKey.isDown) {
      this.ball.x = p.x + (this.facingX || 0) * DRIBBLE_BALL_OFFSET;
      this.ball.y = p.y + (this.facingY || 0) * DRIBBLE_BALL_OFFSET;
      this.ball.setVelocity(0, 0);
    }
  }

  private updateTackle(_delta: number): void {
    const now = Date.now();
    if (now - this.lastTackleTime < TACKLE_COOLDOWN_MS) return;
    if (!Phaser.Input.Keyboard.JustDown(this.tackleKey)) return;
    const p = this.selectedPlayer.sprite;
    for (const o of this.opponents) {
      const dist = Phaser.Math.Distance.Between(p.x, p.y, o.sprite.x, o.sprite.y);
      if (dist > TACKLE_RANGE) continue;
      const owner = this.whoHasPossession();
      if (owner !== 'opponent') continue;
      this.lastTackleTime = now;
      const foul = Math.random() < FOUL_PROBABILITY;
      if (foul) {
        this.setPieceType = 'goal-kick';
        this.setPieceForTeam = 'player';
        this.ball.setVelocity(0, 0);
        this.ball.x = o.sprite.x + 30;
        this.ball.y = o.sprite.y;
        return;
      }
      this.ball.setVelocity(0, 0);
      this.ball.x = p.x + this.facingX * (PLAYER_RADIUS + BALL_RADIUS + 5);
      this.ball.y = p.y + this.facingY * (PLAYER_RADIUS + BALL_RADIUS + 5);
      return;
    }
  }

  private updateBallPossessionAndFirstTouch(_delta: number): void {
    if (this.hasPossession() && !this.dribbleKey.isDown) {
      const p = this.selectedPlayer.sprite;
      this.ball.setVelocity(0, 0);
      this.ball.x = p.x + (this.facingX || 0) * (PLAYER_RADIUS + BALL_RADIUS);
      this.ball.y = p.y + (this.facingY || 1) * (PLAYER_RADIUS + BALL_RADIUS);
      this.ballSpin *= 0.95;
      return;
    }
    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    if (speed < 15) this.ballSpin *= 0.98;
  }

  private updateBallPhysics(delta: number): void {
    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    if (this.ballSpin !== 0) {
      const perpX = -body.velocity.y;
      const perpY = body.velocity.x;
      const len = Math.hypot(perpX, perpY) || 1;
      const curve = this.ballSpin * BALL_SPIN_CURVE_STRENGTH * delta * 0.1;
      body.velocity.x += (perpX / len) * curve;
      body.velocity.y += (perpY / len) * curve;
    }
    this.clampBallToPitch();
  }

  private updatePassAndShoot(_delta: number): void {
    if (this.shootKey.isDown && this.hasPossession()) {
      if (!this.shootChargeStart) this.shootChargeStart = Date.now();
    } else {
      if (this.shootChargeStart !== 0 && this.hasPossession()) {
        const held = Date.now() - this.shootChargeStart;
        const t = Math.min(1, held / SHOOT_CHARGE_TIME_MS);
        const power = SHOOT_SPEED + (SHOOT_SPEED_MAX_CHARGED - SHOOT_SPEED) * t;
        const finesse = this.longPassKey.isDown ? FINESSE_SPEED_MULT : 1;
        this.kickBall(power * finesse);
        this.ballSpin = this.longPassKey.isDown ? 2 : -1;
      }
      this.shootChargeStart = 0;
    }

    if (this.hasPossession() && Phaser.Input.Keyboard.JustDown(this.passKey)) {
      const long = this.longPassKey.isDown;
      this.kickBall(long ? PASS_SPEED_LONG : PASS_SPEED);
      this.ballSpin = long ? 0.5 : 0;
    }
  }

  private kickBall(speed: number): void {
    const len = Math.hypot(this.facingX, this.facingY) || 1;
    this.ball.setVelocity((this.facingX / len) * speed, (this.facingY / len) * speed);
  }

  private updateKeeperAI(_delta: number): void {
    const gkPlayer = this.keeperPlayer;
    const gkOpp = this.keeperOpponent;
    gkPlayer.y = Phaser.Math.Clamp(
      gkPlayer.y + (this.ball.y - gkPlayer.y) * 0.02 * this.keeperDiffMult,
      GOAL_TOP,
      GOAL_BOTTOM
    );
    gkPlayer.x = PITCH_MARGIN_X + 28;
    gkOpp.y = Phaser.Math.Clamp(
      gkOpp.y + (this.ball.y - gkOpp.y) * 0.02 * this.keeperDiffMult,
      GOAL_TOP,
      GOAL_BOTTOM
    );
    gkOpp.x = PITCH_MARGIN_X + PITCH_WIDTH - 28;

    const body = this.ball.body as Phaser.Physics.Arcade.Body;
    const ballSpeed = Math.hypot(body.velocity.x, body.velocity.y);
    if (ballSpeed > 100 && body.velocity.x < 0 && this.ball.x < PITCH_MARGIN_X + 80) {
      const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, gkPlayer.x, gkPlayer.y);
      if (dist < KEEPER_SAVE_RADIUS * this.keeperDiffMult) {
        this.ball.setVelocity(-body.velocity.x * 0.3, body.velocity.y * 0.2);
        this.ballSpin = 0;
      }
    }
    if (ballSpeed > 100 && body.velocity.x > 0 && this.ball.x > PITCH_MARGIN_X + PITCH_WIDTH - 80) {
      const dist = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, gkOpp.x, gkOpp.y);
      if (dist < KEEPER_SAVE_RADIUS * this.keeperDiffMult) {
        this.ball.setVelocity(-body.velocity.x * 0.3, body.velocity.y * 0.2);
        this.ballSpin = 0;
      }
    }
  }

  private updateTeammateAI(_delta: number): void {
    for (let i = 0; i < this.players.length; i++) {
      if (i === this.selectedIndex) continue;
      const data = this.players[i];
      const s = data.sprite;
      const body = s.body as Phaser.Physics.Arcade.Body;
      const dx = data.homeX - s.x;
      const dy = data.homeY - s.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 20) {
        const sp = (data.speed * 0.4) / Math.max(dist / 50, 1);
        body.setVelocity((dx / dist) * sp, (dy / dist) * sp);
      } else {
        body.setVelocity(0, 0);
      }
    }
  }

  private updateOpponentAI(_delta: number): void {
    const owner = this.whoHasPossession();
    for (const o of this.opponents) {
      const s = o.sprite;
      const body = s.body as Phaser.Physics.Arcade.Body;
      const toBallX = this.ball.x - s.x;
      const toBallY = this.ball.y - s.y;
      const distToBall = Math.hypot(toBallX, toBallY);
      if (owner === 'player' && distToBall < OPPONENT_PRESS_DIST) {
        const sp = OPPONENT_SPEED / Math.max(distToBall / 50, 1);
        body.setVelocity((toBallX / distToBall) * sp, (toBallY / distToBall) * sp);
      } else if (owner !== 'opponent') {
        const dx = o.homeX - s.x;
        const dy = o.homeY - s.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 15) {
          const sp = (OPPONENT_SPEED * 0.5) / Math.max(dist / 40, 1);
          body.setVelocity((dx / dist) * sp, (dy / dist) * sp);
        } else {
          body.setVelocity(0, 0);
        }
      } else {
        const dx = o.homeX - s.x;
        const dy = o.homeY - s.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 15) {
          body.setVelocity((dx / dist) * 30, (dy / dist) * 30);
        } else {
          body.setVelocity(0, 0);
        }
      }
    }
  }

  private checkGoals(): void {
    const inLeftGoal =
      this.ball.x <= PITCH_MARGIN_X + GOAL_LINE_OFFSET + 15 &&
      this.ball.y >= GOAL_TOP &&
      this.ball.y <= GOAL_BOTTOM;
    const inRightGoal =
      this.ball.x >= PITCH_MARGIN_X + PITCH_WIDTH - GOAL_LINE_OFFSET - 15 &&
      this.ball.y >= GOAL_TOP &&
      this.ball.y <= GOAL_BOTTOM;
    if (inLeftGoal) {
      this.scoreOpponent += 1;
      this.startReplay('opponent');
    } else if (inRightGoal) {
      this.scorePlayer += 1;
      this.startReplay('player');
    }
  }

  private startReplay(scorer: 'player' | 'opponent'): void {
    this.replayMode = true;
    this.replayStartTime = Date.now();
    this.replaySnapshots = [...this.replayBuffer];
    this.lastReplayScorer = scorer;
  }

  private checkOutOfPlay(): void {
    if (this.setPieceType) return;
    const bx = this.ball.x;
    const by = this.ball.y;
    const left = bx < PITCH_MARGIN_X - 5;
    const right = bx > PITCH_MARGIN_X + PITCH_WIDTH + 5;
    const top = by < PITCH_MARGIN_Y - 5;
    const bottom = by > PITCH_MARGIN_Y + PITCH_HEIGHT + 5;
    if (top || bottom) {
      this.setPieceType = 'throw-in';
      this.setPieceForTeam = by < PITCH_MARGIN_Y + PITCH_HEIGHT / 2 ? 'opponent' : 'player';
      if (this.setPieceForTeam === 'player') {
        this.ball.x = PITCH_MARGIN_X + 50;
        this.ball.y = top ? PITCH_MARGIN_Y + 20 : PITCH_MARGIN_Y + PITCH_HEIGHT - 20;
      } else {
        this.ball.x = PITCH_MARGIN_X + PITCH_WIDTH - 50;
        this.ball.y = top ? PITCH_MARGIN_Y + 20 : PITCH_MARGIN_Y + PITCH_HEIGHT - 20;
      }
      this.ball.setVelocity(0, 0);
      this.setPieceAim = 0;
      this.setPiecePower = 0.5;
    } else if (left || right) {
      const inGoal = by >= GOAL_TOP && by <= GOAL_BOTTOM;
      if (inGoal) return;
      if (right) {
        this.setPieceType = 'corner';
        this.setPieceForTeam = 'player';
        this.ball.x = PITCH_MARGIN_X + PITCH_WIDTH - 10;
        this.ball.y = by < PITCH_MARGIN_Y + PITCH_HEIGHT / 2 ? PITCH_MARGIN_Y + 15 : PITCH_MARGIN_Y + PITCH_HEIGHT - 15;
      } else {
        this.setPieceType = 'corner';
        this.setPieceForTeam = 'opponent';
        this.ball.x = PITCH_MARGIN_X + 10;
        this.ball.y = by < PITCH_MARGIN_Y + PITCH_HEIGHT / 2 ? PITCH_MARGIN_Y + 15 : PITCH_MARGIN_Y + PITCH_HEIGHT - 15;
      }
      this.ball.setVelocity(0, 0);
      this.setPieceAim = 0;
      this.setPiecePower = 0.6;
    }
  }

  private updateSetPiece(delta: number): void {
    if (this.setPieceType === null) return;
    if (this.setPieceForTeam === 'player') {
      if (this.cursors.left.isDown) this.setPieceAim -= SET_PIECE_AIM_SPEED * (delta / 1000);
      if (this.cursors.right.isDown) this.setPieceAim += SET_PIECE_AIM_SPEED * (delta / 1000);
      if (this.cursors.up.isDown) this.setPiecePower = Math.min(SET_PIECE_POWER_MAX, this.setPiecePower + 0.3 * (delta / 1000));
      if (this.cursors.down.isDown) this.setPiecePower = Math.max(0.2, this.setPiecePower - 0.3 * (delta / 1000));
      if (Phaser.Input.Keyboard.JustDown(this.passKey)) {
        const angle = this.setPieceAim * 0.5;
        const power = 200 + this.setPiecePower * 250;
        this.ball.setVelocity(Math.cos(angle) * power, Math.sin(angle) * power);
        this.setPieceType = null;
        this.setPieceForTeam = null;
      }
    } else {
      this.setPieceType = null;
      this.setPieceForTeam = null;
      const angle = (Math.random() - 0.5) * 1.5;
      this.ball.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
    }
  }

  private clampBallToPitch(): void {
    const minX = PITCH_MARGIN_X + BALL_RADIUS;
    const maxX = PITCH_MARGIN_X + PITCH_WIDTH - BALL_RADIUS;
    const minY = PITCH_MARGIN_Y + BALL_RADIUS;
    const maxY = PITCH_MARGIN_Y + PITCH_HEIGHT - BALL_RADIUS;
    this.ball.x = Phaser.Math.Clamp(this.ball.x, minX, maxX);
    this.ball.y = Phaser.Math.Clamp(this.ball.y, minY, maxY);
  }

  private clampAllToPitch(): void {
    const minX = PITCH_MARGIN_X + PLAYER_RADIUS;
    const maxX = PITCH_MARGIN_X + PITCH_WIDTH - PLAYER_RADIUS;
    const minY = PITCH_MARGIN_Y + PLAYER_RADIUS;
    const maxY = PITCH_MARGIN_Y + PITCH_HEIGHT - PLAYER_RADIUS;
    for (const p of this.players) {
      p.sprite.x = Phaser.Math.Clamp(p.sprite.x, minX, maxX);
      p.sprite.y = Phaser.Math.Clamp(p.sprite.y, minY, maxY);
    }
    for (const o of this.opponents) {
      o.sprite.x = Phaser.Math.Clamp(o.sprite.x, minX, maxX);
      o.sprite.y = Phaser.Math.Clamp(o.sprite.y, minY, maxY);
    }
    this.keeperPlayer.x = Phaser.Math.Clamp(this.keeperPlayer.x, PITCH_MARGIN_X, PITCH_MARGIN_X + 50);
    this.keeperPlayer.y = Phaser.Math.Clamp(this.keeperPlayer.y, GOAL_TOP, GOAL_BOTTOM);
    this.keeperOpponent.x = Phaser.Math.Clamp(this.keeperOpponent.x, PITCH_MARGIN_X + PITCH_WIDTH - 50, PITCH_MARGIN_X + PITCH_WIDTH);
    this.keeperOpponent.y = Phaser.Math.Clamp(this.keeperOpponent.y, GOAL_TOP, GOAL_BOTTOM);
  }

  private resetPositionsAfterGoal(): void {
    this.ball.setVelocity(0, 0);
    this.ball.x = PITCH_MARGIN_X + PITCH_WIDTH / 2;
    this.ball.y = PITCH_MARGIN_Y + PITCH_HEIGHT / 2;
    this.ballSpin = 0;
    const playerPos = formationToWorldPositions(this.formationKey, true);
    const oppPos = formationToWorldPositions(this.formationKey, false);
    for (let i = 0; i < TEAM_SIZE; i++) {
      this.players[i].sprite.setPosition(playerPos[i].x, playerPos[i].y);
      this.players[i].sprite.setVelocity(0, 0);
      this.players[i].homeX = playerPos[i].x;
      this.players[i].homeY = playerPos[i].y;
      this.opponents[i].sprite.setPosition(oppPos[i].x, oppPos[i].y);
      this.opponents[i].sprite.setVelocity(0, 0);
      this.opponents[i].homeX = oppPos[i].x;
      this.opponents[i].homeY = oppPos[i].y;
    }
    this.keeperPlayer.setPosition(PITCH_MARGIN_X + 30, PITCH_MARGIN_Y + PITCH_HEIGHT / 2);
    this.keeperPlayer.setVelocity(0, 0);
    this.keeperOpponent.setPosition(PITCH_MARGIN_X + PITCH_WIDTH - 30, PITCH_MARGIN_Y + PITCH_HEIGHT / 2);
    this.keeperOpponent.setVelocity(0, 0);
  }

  private refreshHud(): void {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = Math.floor(this.timeRemaining % 60);
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    const halfStr = this.half === 1 ? '1H' : '2H';
    const stamina = this.selectedPlayer.stamina;
    const staminaStr = Math.floor(stamina).toString();
    const selStr = `P${this.selectedIndex + 1}`;
    const setPieceStr = this.setPieceType ? ` [${this.setPieceType}]` : '';
    const endMsg = this.matchEnded ? ' — R to restart' : '';
    this.hudText.setText(
      `${this.scorePlayer}-${this.scoreOpponent}  ${halfStr} ${timeStr}  Stamina:${staminaStr}  ${selStr}${setPieceStr}${endMsg}`
    );
    this.staminaBar.clear();
    this.staminaBar.fillStyle(0x333333, 0.8);
    this.staminaBar.fillRect(20, 42, 104, 14);
    this.staminaBar.fillStyle(stamina > STAMINA_EXHAUSTED_THRESHOLD ? 0x00aa00 : 0xaa0000, 1);
    this.staminaBar.fillRect(22, 44, (stamina / STAMINA_MAX) * 100, 10);
  }
}
