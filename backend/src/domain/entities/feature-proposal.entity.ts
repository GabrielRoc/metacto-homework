export class FeatureProposal {
  readonly id: string;
  readonly text: string;
  readonly authorId: string;
  readonly upvoteCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly authorEmail?: string;

  constructor(props: {
    id: string;
    text: string;
    authorId: string;
    upvoteCount: number;
    createdAt: Date;
    updatedAt: Date;
    authorEmail?: string;
  }) {
    this.id = props.id;
    this.text = props.text;
    this.authorId = props.authorId;
    this.upvoteCount = props.upvoteCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.authorEmail = props.authorEmail;
  }
}
