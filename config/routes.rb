Rails.application.routes.draw do
  devise_for :users
  resources :scores
  root 'scores#index'
end
