class ScoresController < ApplicationController
  before_action :authenticate_user!, only: [:new, :create, :edit, :update, :destroy]
  before_action :set_score, only: [:show, :edit, :update, :destroy]
  before_action :ensure_user_owns_score, only: [:edit, :update, :destroy]

  def index
    @scores = Score.all
  end

  def show
    @score = Score.find(params[:id])
  end

  def new
    @score = current_user.scores.build
  end

  def create
    @score = current_user.scores.build(score_params)
    
    if @score.save
      render json: { status: 'success', redirect_url: scores_path }
    else
      render json: { status: 'error', errors: @score.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @score.update(score_params)
      render json: { status: 'success', redirect_url: score_path(@score) }
    else
      render json: { status: 'error', errors: @score.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @score.destroy
    respond_to do |format|
      format.html { redirect_to scores_url, notice: '楽譜が正常に削除されました。' }
      format.json { head :no_content }
    end
  end

  private

  def set_score
    @score = Score.find(params[:id])
  end

  def ensure_user_owns_score
    return if current_user == @score.user

    redirect_to root_path
  end

  def score_params
    params.require(:score).permit(:title, :artist, :content).merge(user_id: current_user.id)
  end
end
