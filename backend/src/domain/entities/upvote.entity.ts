export class Upvote {
  readonly id: string;
  readonly authorId: string;
  readonly featureId: string;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    authorId: string;
    featureId: string;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.authorId = props.authorId;
    this.featureId = props.featureId;
    this.createdAt = props.createdAt;
  }
}
